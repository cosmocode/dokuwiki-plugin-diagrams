/**
 * Callback for saving a diagram
 * @callback saveCallback
 * @param {string} svg The SVG data to save
 * @returns {Promise<boolean>|boolean} true if saving was successful, false otherwise
 */

/**
 * Callback for when saving has finished suscessfully
 * @callback postSaveCallback
 */


/**
 * This class encapsulates all interaction with the diagrams editor
 *
 * It manages displaying and communicating with the editor, most importantly in manages loading
 * and saving diagrams.
 *
 * Note: devs should take care to ensure that only ever one instance of this class is active at a time
 * in the same window.
 *
 * FIXME we're not catching any fetch exceptions currently. Should we?
 * @class
 */
class DiagramsEditor {
    /** @type {HTMLIFrameElement} the editor iframe */
    #diagramsEditor = null;

    /** @type {saveCallback} the method to call for saving the diagram */
    #saveCallback = null;

    /** @type {postSaveCallback} called when saving has finished*/
    #postSaveCallback = null;

    /** @type {string} the initial save data to load, set by one of the edit* methods */
    #svg = '';

    /** @type {function} the bound message listener */
    #listener = null;

    /**
     * Create a new diagrams editor
     *
     * @param {postSaveCallback} postSaveCallback Called when saving has finished
     */
    constructor(postSaveCallback = null) {
        this.#postSaveCallback = postSaveCallback;
    }

    /**
     * Initialize the editor for editing a media file
     *
     * @param {string} mediaid The media ID to edit, if 404 a new file will be created
     */
    async editMediaFile(mediaid) {
        this.#saveCallback = (svg) => this.#saveMediaFile(mediaid, svg);

        const response = await fetch(DOKU_BASE + 'lib/exe/fetch.php?media=' + mediaid, {
            method: 'GET',
            cache: 'no-cache',
        });

        if (response.ok) {
            // if not 404, load the SVG data
            this.#svg = await response.text();
        }

        this.#createEditor();
    }

    /**
     * Initialize the editor for editing an embedded diagram
     *
     * @param {string} pageid The page ID to on which the diagram is embedded
     * @param {int} position The position of the diagram in the page
     * @param {int} length The length of the diagram in the page
     */
    async editEmbed(pageid, position, length) {
        this.#saveCallback = (svg) => this.#saveEmbed(pageid, position, length, svg);

        const url = DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_embed_load' +
            '&id=' + encodeURIComponent(pageid) +
            '&pos=' + encodeURIComponent(position) +
            '&len=' + encodeURIComponent(length);

        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache',
        });

        if (response.ok) {
            // if not 404, load the SVG data
            this.#svg = await response.text();
        } else {
            // a 404 for an embedded diagram should not happen
            alert(LANG.plugins.diagrams.errorLoading);
            return;
        }

        this.#createEditor();
    }

    /**
     * Initialize the editor for editing a diagram in memory
     *
     * @param {string} svg The SVG raw data to edit, empty for new file
     * @param {saveCallback} callback The callback to call when the editor is closed
     */
    editMemory(svg, callback) {
        this.#svg = svg;
        this.#saveCallback = callback.bind(this);
        this.#createEditor();
    }

    /**
     * Saves a diagram as a media file
     *
     * @param {string} mediaid The media ID to save
     * @param {string} svg The SVG raw data to save
     * @returns {Promise<boolean>}
     */
    async #saveMediaFile(mediaid, svg) {
        const uploadUrl = this.#mediaUploadUrl(mediaid);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            cache: 'no-cache',
            body: DiagramsEditor.svgThemeProcessing(svg),
        });

        return response.ok;
    }

    /**
     * Saves a diagram as an embedded diagram
     *
     * This replaces the previous diagram at the given postion
     *
     * @param {string} pageid The page ID on which the diagram is embedded
     * @param {int} position The position of the diagram in the page
     * @param {int} length The length of the diagram as it was before
     * @param {string} svg The SVG raw data to save
     * @returns {Promise<boolean>}
     */
    async #saveEmbed(pageid, position, length, svg) {
        const uploadUrl = DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_embed_save' +
            '&id=' + encodeURIComponent(pageid) +
            '&pos=' + encodeURIComponent(position) +
            '&len=' + encodeURIComponent(length) +
            '&sectok=' + JSINFO['sectok'];

        const body = new FormData();
        body.set('svg', DiagramsEditor.svgThemeProcessing(svg));

        const response = await fetch(uploadUrl, {
            method: 'POST',
            cache: 'no-cache',
            body: body,
        });

        return response.ok;
    }

    /**
     * Save the PNG cache for a diagram
     *
     * @param {string} svg
     * @param {string} png
     * @returns {Promise<boolean>}
     */
    async #savePngCache(svg, png) {
        const uploadUrl = DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_savecache' +
            '&sectok=' + JSINFO['sectok'];

        const body = new FormData();
        body.set('svg', DiagramsEditor.svgThemeProcessing(svg));
        body.set('png', png);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            cache: 'no-cache',
            body: body,
        });

        return response.ok;
    }

    /**
     * Create the editor iframe and attach the message listener
     */
    #createEditor() {
        this.#diagramsEditor = document.createElement('iframe');
        this.#diagramsEditor.id = 'plugin__diagrams-editor';
        this.#diagramsEditor.src = JSINFO['plugins']['diagrams']['service_url'] + '&ui=' + JSINFO['plugins']['diagrams']['theme'];
        document.body.appendChild(this.#diagramsEditor);

        this.#listener = this.#handleMessage.bind(this);
        window.addEventListener('message', this.#listener);
    }

    /**
     * Remove the editor iframe and detach the message listener
     */
    #removeEditor() {
        if (this.#diagramsEditor === null) return;
        this.#diagramsEditor.remove();
        this.#diagramsEditor = null;
        window.removeEventListener('message', this.#listener);
    }

    /**
     * Get the raw data from a data URI
     *
     * @param {string} dataUri
     * @returns {string|null}
     */
    #decodeDataUri(dataUri) {
        const matches = dataUri.match(/^data:(.*);base64,(.*)$/);
        if (matches === null) return null;

        return decodeURIComponent(
            atob(matches[2])
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
    }

    /**
     * Add additional theme properties to svg data
     *
     * @param {string} svg The raw SVG data
     * @return {string}
     */
    static svgThemeProcessing(svg)
    {
        if (JSINFO['plugins']['diagrams']['theme'] !== 'dark') return svg;

        const parser = new DOMParser();
        const xml = parser.parseFromString(svg, "image/svg+xml");

        xml.documentElement.setAttribute('class', 'ge-export-svg-dark');

        const darkStyle = xml.createElementNS(xml.documentElement.namespaceURI, 'style');
        darkStyle.setAttribute('type', 'text/css');
        darkStyle.textContent = 'svg.ge-export-svg-dark { filter: invert(100%) hue-rotate(180deg); }&#xa;svg.ge-export-svg-dark foreignObject img,&#xa;svg.ge-export-svg-dark image:not(svg.ge-export-svg-dark switch image),&#xa;svg.ge-export-svg-dark svg { filter: invert(100%) hue-rotate(180deg) }';

        const defs = xml.getElementsByTagName('defs')[0];        
        defs.appendChild(darkStyle);

        return new XMLSerializer().serializeToString(xml);
    }

    /**
     * Handle messages from diagramming service
     *
     * @param {Event} event
     */
    async #handleMessage(event) {
        const msg = JSON.parse(event.data);

        switch (msg.event) {
            case 'init':
                // load the SVG data into the editor
                this.#diagramsEditor.contentWindow.postMessage(JSON.stringify({action: 'load', xml: this.#svg}), '*');
                break;
            case 'save':
                this.#svg = '';

                // Save triggers an export to SVG action
                this.#diagramsEditor.contentWindow.postMessage(
                    JSON.stringify({
                        action: 'export',
                        format: 'xmlsvg',
                        spin: LANG.plugins.diagrams.saving
                    }),
                    '*'
                );
                break;
            case 'export':
                if (msg.format === 'svg') {
                    this.#svg = this.#decodeDataUri(msg.data);
                    this.#svg = DiagramsEditor.svgThemeProcessing(this.#svg);

                    // export again as PNG
                    this.#diagramsEditor.contentWindow.postMessage(
                        JSON.stringify({
                            action: 'export',
                            format: 'png',
                            spin: LANG.plugins.diagrams.saving
                        }),
                        '*'
                    );
                } else if (msg.format === 'png') {
                    const png = msg.data; // keep as data uri, for binary safety
                    let ok = await this.#savePngCache(this.#svg, png);
                    if (!ok) {
                        alert(LANG.plugins.diagrams.errorSaving);
                        return;
                    }
                    ok = await this.#saveCallback(this.#svg);
                    if (ok) {
                        this.#removeEditor();
                        if (this.#postSaveCallback !== null) {
                            this.#postSaveCallback();
                        }
                    } else {
                        alert(LANG.plugins.diagrams.errorSaving);
                    }
                } else {
                    alert(LANG.plugins.diagrams.errorUnsupportedFormat);
                    return;
                }
                break;
            case 'exit':
                this.#removeEditor();
                break;
        }
    }

    /**
     * Get the URL to upload a media file
     * @param {string} mediaid
     * @returns {string}
     */
    #mediaUploadUrl(mediaid) {
        // split mediaid into namespace and id
        let id = mediaid;
        let ns = '';
        const idParts = id.split(':');
        if (idParts.length > 1) {
            id = idParts.pop(idParts);
            ns = idParts.join(':');
        }

        return DOKU_BASE +
            'lib/exe/ajax.php?call=mediaupload&ow=true&ns=' +
            encodeURIComponent(ns) +
            '&qqfile=' +
            encodeURIComponent(id) +
            '&sectok=' +
            encodeURIComponent(JSINFO['sectok']);
    }
}
