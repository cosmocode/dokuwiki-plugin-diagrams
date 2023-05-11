class DiagramsForm extends KeyValueForm {

    /** {DiagramsView} The view of the currently selected node */
    #view = null;

    constructor(name = 'diagrams-form', fields = []) {
        if (fields.length === 0) {
            fields = [
                {
                    label: LANG.plugins.diagrams.mediaSource, name: 'src'
                },
                {
                    type: 'select', 'label': LANG.plugins.diagrams.alignment, 'options':
                        [
                            {name: 'alignment', value: '', label: ''},
                            {name: 'alignment', value: 'left', label: LANG.plugins.diagrams.left},
                            {name: 'alignment', value: 'right', label: LANG.plugins.diagrams.right},
                            {name: 'alignment', value: 'center', label: LANG.plugins.diagrams.center}
                        ]
                }
            ];
        }

        super(name, fields);

        this.$form.on('submit', (event) => {
            event.preventDefault(); // prevent form submission
            this.updateViewFromForm();
            this.#view.deselectNode();
        });

        if (!this.instance) {
            // media manager button
            const selectButton = document.createElement('button');
            selectButton.innerText = LANG.plugins.diagrams.selectSource;
            selectButton.className = 'diagrams-btn-select';
            selectButton.addEventListener('click', DiagramsForm.openMediaManager);
            this.$form.find('fieldset').prepend(selectButton);
            window.dMediaSelect = this.mediaSelect.bind(this);

            // editor button
            const editButton = document.createElement('button');
            editButton.className = 'diagrams-btn-edit';
            editButton.id = 'diagrams__btn-edit';
            editButton.innerText = LANG.plugins.diagrams.editButton;
            this.$form.find('fieldset').prepend(editButton);

            editButton.addEventListener('click', event => {
                event.preventDefault(); // prevent form submission

                const url = this.#view.node.attrs.url;
                const mediaid = this.#view.node.attrs.id;

                if(this.#view.node.attrs.type === 'mediafile') {
                    const diagramsEditor = new DiagramsEditor(this.onSavedMediaFile.bind(this, url));
                    diagramsEditor.editMediaFile(mediaid);
                } else {
                    const diagramsEditor = new DiagramsEditor();
                    diagramsEditor.editMemory(url, this.onSaveEmbed.bind(this));
                }

            });
        }

        return this.instance;
    }

    /**
     * Update the form to reflect the new selected nodeView
     *
     * @param {DiagramsView} view
     */
    updateFormFromView(view) {
        this.#view = view;

        // update form fields to reflect new node

        this.$form.find('[name="src"]').val(view.node.attrs.id);

        // this.dForm.setWidth(view.node.attrs.width);
        // this.dForm.setHeight(view.node.attrs.height);


        const align = view.node.attrs.align;
        this.$form.find('[name="alignment"]').prop('selected', '');
        this.$form.find(`[name="alignment"][value="${align}"]`).prop('selected', 'selected');
    }

    updateViewFromForm() {
        const newAttrs = this.getAttributes();
        console.log('updateViewFromForm', newAttrs);
        this.#view.dispatchNodeUpdate(newAttrs);
    }

    getAttributes() {
        const attrs = {};
        attrs.id = this.$form.find('[name="src"]').val();
        attrs.align = this.$form.find('[name="alignment"]:selected').val();
        attrs.type = this.#view.node.attrs.type;

        // fixme this is only correct for media files
        if(this.#view.node.attrs.type === 'embed') {
            attrs.url = this.#view.node.attrs.url; // keep the data uri
        } else {
            attrs.url = `${DOKU_BASE}lib/exe/fetch.php?cache=nocache&media=` + attrs.id;
        }
        return attrs;
    }


    /**
     * After svaing a media file reload the src for all images using it
     *
     * @see https://stackoverflow.com/a/66312176
     * @param {string} url
     * @returns {Promise<void>}
     */
    async onSavedMediaFile(url) {
        await fetch(url, {cache: 'reload', mode: 'no-cors'});
        document.body.querySelectorAll(`img[src='${url}']`)
            .forEach(img => img.src = url)
    }

    /**
     * Save an embedded diagram back to the editor
     */
    onSaveEmbed(svg) {
        // FIXME how do we update the diagram?
        const url = 'data:image/svg+xml;base64,' + btoa(svg);

        this.#view.node.attrs.url = url;
        this.updateViewFromForm();

        return true;
    }

    setEditButtonUrl(id, url) {
        const $editButton = jQuery(this.$form.find('#diagrams__btn-edit'));
        // FIXME show/hide button depending on set url
        $editButton.attr('data-id', id);
        $editButton.attr('data-url', url);
    }

    setSource(id = '') {
        this.$form.find('[name="src"]').val(id);
    }

    getSource() {
        return this.$form.find('[name="src"]').val();
    }

    setAlignment(align = '') {
    }

    getAlignment() {
        return this.$form.find('[name="alignment"]:checked').val();
    }

    resetForm() {
        this.setSource();
        this.setAlignment();
    }

    static resolveSubmittedLinkData(initialAttrs, $diagramsForm, callback) {
        return (event) => {
            event.preventDefault();
            const newAttrs = { ...initialAttrs };
            newAttrs.id = $diagramsForm.getSource();
            // FIXME is this conditional?
            newAttrs.url = `${DOKU_BASE}lib/exe/fetch.php?cache=nocache&media=` + $diagramsForm.getSource();
            newAttrs.align = $diagramsForm.getAlignment();

            callback(newAttrs);
        };
    }

    static openMediaManager() {
        window.open(
            `${DOKU_BASE}lib/exe/mediamanager.php?ns=${encodeURIComponent(JSINFO.namespace)}&onselect=dMediaSelect`,
            'mediaselect',
            'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes',
        );
    }

    mediaSelect(edid, mediaid, opts, align) {
        this.setSource(mediaid);
    }
}
