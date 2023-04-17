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
 * FIXME we're not catching any fetch exceptions currently. Should we?
 * FIXME should we somehow ensure that there is only ever one instance of this class?
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
            body: svg,
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
        body.set('svg', svg);

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
        this.#diagramsEditor.src = JSINFO['plugins']['diagrams']['service_url'];
        document.body.appendChild(this.#diagramsEditor);
        window.addEventListener('message', this.#handleMessage.bind(this));
    }

    /**
     * Remove the editor iframe and detach the message listener
     */
    #removeEditor() {
        if (this.#diagramsEditor === null) return;
        this.#diagramsEditor.remove();
        this.#diagramsEditor = null;
        window.removeEventListener('message', this.#handleMessage.bind(this));
    }

    /**
     * Handle messages from diagramming service
     *
     * @param {Event} event
     */
    async #handleMessage(event) {
        const msg = JSON.parse(event.data);
        console.log(msg);

        switch (msg.event) {
            case 'init':
                // load the SVG data into the editor
                this.#diagramsEditor.contentWindow.postMessage(JSON.stringify({action: 'load', xml: this.#svg}), '*');
                break;
            case 'save':
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
                if (msg.format !== 'svg') {
                    alert(LANG.plugins.diagrams.errorUnsupportedFormat);
                    return;
                }
                const ok = await this.#saveCallback(
                    // msg.data contains the SVG as a Base64 encoded data URI
                    decodeURIComponent(atob(
                        msg.data.split(',')[1])
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    )
                );
                if (ok) {
                    this.#removeEditor();
                    if (this.#postSaveCallback !== null) {
                        this.#postSaveCallback();
                    }
                } else {
                    alert(LANG.plugins.diagrams.errorSaving);
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
