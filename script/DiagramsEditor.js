/**
 * FIXME should messages be sent to diagramsEditor.contentWindow instead of diagramsEditor?
 */
class DiagramsEditor {
    /** @type {HTMLIFrameElement} the editor iframe */
    diagramsEditor = null;

    /** @type {CallableFunction} the method to call for saving the diagram */
    handleSave = null;

    /**
     * Initialize the editor for editing a media file
     *
     * @param {string} mediaid The media ID to edit, if 404 a new file will be created
     */
    async editMediaFile(mediaid) {
        this.#createEditor();

        this.handleSave = (svg) => this.#saveMediaFile(mediaid, svg);

        const response = await fetch(DOKU_BASE + 'lib/exe/fetch.php?media=' + mediaid, {
            method: 'GET',
            cache: 'no-cache',
        });

        let svg = '';
        if (response.ok) {
            // if not 404, load the SVG data
            svg = await response.text();
        }

        this.#loadDocument(svg);
    }

    /**
     * Initialize the editor for editing an embedded diagram
     *
     * @param {string} pageid The page ID to on which the diagram is embedded
     * @param {int} index The index of the diagram on the page (0-based)
     */
    async editEmbed(pageid, index) {
        this.#createEditor();

        this.handleSave = (svg) => this.#saveEmbed(pageid, index, svg);

        const response = await fetch(DOKU_BASE + 'lib/exe/fetch.php?media=' + mediaid, {
            method: 'GET',
            cache: 'no-cache',
        });

        let svg = '';
        if (response.ok) {
            // if not 404, load the SVG data
            svg = await response.text();
        } else {
            // a 404 for an embedded diagram should not happen
            alert(LANG.plugins.diagrams.errorLoading);
            this.#removeEditor();
            return;
        }

        this.#loadDocument(svg);
    }

    /**
     * Initialize the editor for editing a diagram in memory
     *
     * @param {string} svg The SVG raw data to edit, empty for new file
     * @param {CallableFunction} callback The callback to call when the editor is closed
     */
    editMemory(svg, callback) {
        this.#createEditor();
        this.handleSave = callback;
        this.#loadDocument(svg);
    }

    #saveMediaFile(mediaid, svg) {
        // FIXME save to media file


    }

    #saveEmbed(pageid, index, svg) {
        // FIXME save to page
    }

    /**
     * Create the editor iframe and attach the message listener
     */
    #createEditor() {
        this.diagramsEditor = document.createElement('iframe');
        this.diagramsEditor.id = 'diagrams-frame';
        this.diagramsEditor.style = {
            border: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
        }; // FIXME assign these via CSS
        this.diagramsEditor.src = JSINFO['plugins']['diagrams']['service_url'];
        document.body.appendChild(this.diagramsEditor);
        window.addEventListener('message', this.#handleMessage.bind(this)); // FIXME might need to be public
    }

    /**
     * Remove the editor iframe and detach the message listener
     */
    #removeEditor() {
        this.diagramsEditor.remove();
        this.diagramsEditor = null;
        window.removeDiagramsEditor(this.#handleMessage.bind(this));
    }

    /**
     * Load the given SVG document into the editor
     *
     * @param {string} svg
     */
    #loadDocument(svg) {
        this.diagramsEditor.postMessage(JSON.stringify({action: 'load', xml: svg}), '*');
    }

    /**
     * Handle messages from diagramming service
     *
     * @param {Event} event
     */
    #handleMessage(event) {
        // FIXME do we need this originalEvent here? or is that jQuery specific?
        const msg = JSON.parse(event.originalEvent.data);

        switch (msg.event) {
            case 'init':
                // FIXME do we need to wait for this? before we can call #loadDocument?
                break;
            case 'save':
                // Save triggers an export to SVG action
                this.diagramsEditor.postMessage(
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
                this.handleSave(
                    // FIXME we used to prepend a doctype, but doctypes are no longer recommended for SVG
                    // FIXME we may need to add a XML header though?
                    decodeURIComponent(atob(
                        msg.data.split(',')[1])
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    )
                );
                break;
            case 'exit':
                this.#removeEditor();
                break;
        }
    }

}
