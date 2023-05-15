/**
 * ProseMirror Form for editing diagram attribute
 */
class DiagramsForm extends KeyValueForm {

    /** {DiagramsForm} The singleton instance */
    static #instance = null;

    /** {DiagramsView} The view of the currently selected node */
    #view = null;

    /**
     * Get the singleton instance of this class
     *
     * @returns {DiagramsForm}
     */
    static getInstance() {
        if (!this.#instance) {
            this.#instance = new DiagramsForm();
        }

        return this.#instance;
    }

    /**
     * Initialize the KeyValue form with fields and event handlers
     *
     * @internal Use DiagramsForm.getInstance() instead
     */
    constructor() {
        const name = 'diagrams-form'; // FIXME localize

        const fields = [
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
            },
            {
                label: LANG.plugins.diagrams.title, name: 'title'
            }
        ];

        super(name, fields);

        this.$form.on('submit', (event) => {
            event.preventDefault(); // prevent form submission
            this.updateViewFromForm();
            this.#view.deselectNode();
        });


        // media manager button
        const selectButton = document.createElement('button');
        selectButton.innerText = LANG.plugins.diagrams.selectSource;
        selectButton.className = 'diagrams-btn-select';
        selectButton.addEventListener('click', () =>
            window.open(
                `${DOKU_BASE}lib/exe/mediamanager.php?ns=${encodeURIComponent(JSINFO.namespace)}&onselect=dMediaSelect`,
                'mediaselect',
                'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes',
            )
        );
        this.$form.find('fieldset').prepend(selectButton);
        window.dMediaSelect = this.mediaSelect.bind(this); // register as global function

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

            if (this.#view.node.attrs.type === 'mediafile') {
                const diagramsEditor = new DiagramsEditor(this.onSavedMediaFile.bind(this, url));
                diagramsEditor.editMediaFile(mediaid);
            } else {
                const diagramsEditor = new DiagramsEditor();
                diagramsEditor.editMemory(url, this.onSaveEmbed.bind(this));
            }

        });
    }

    /**
     * Update the form to reflect the new selected nodeView
     *
     * @param {DiagramsView} view
     */
    updateFormFromView(view) {
        this.#view = view;

        this.$form.find('[name="src"]').val(view.node.attrs.id);
        this.$form.find('[name="title"]').val(view.node.attrs.title);

        const align = view.node.attrs.align;
        this.$form.find('[name="alignment"]').prop('selected', '');
        this.$form.find(`[name="alignment"][value="${align}"]`).prop('selected', 'selected');
    }

    /**
     * Update the nodeView to reflect the new form values
     *
     * @todo the nodeView might not be set, in that case we probably need to create a new one
     */
    updateViewFromForm() {
        const newAttrs = this.getAttributes();
        this.#view.dispatchNodeUpdate(newAttrs);
    }

    /**
     * Construct a new attributes object from the current form values
     *
     * @returns {object}
     */
    getAttributes() {
        const attrs = {};
        attrs.id = this.$form.find('[name="src"]').val();
        attrs.align = this.$form.find('[name="alignment"]:selected').val();
        attrs.title = this.$form.find('[name="title"]').val();
        attrs.width = this.#view.node.attrs.width;
        attrs.height = this.#view.node.attrs.height;
        attrs.type = this.#view.node.attrs.type;

        if (this.#view.node.attrs.type === 'embed') {
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
     *
     * @todo if the nodeView is not set, we need to create a new one
     */
    onSaveEmbed(svg) {
        this.#view.node.attrs.url = 'data:image/svg+xml;base64,' + btoa(svg);
        this.updateViewFromForm();
        return true;
    }

    /**
     * Callback called from the media popup on selecting a file
     *
     * This is globally registered as window.dMediaSelect
     *
     * @todo if the given mediaid is not a diagram we need to show an error and ignore it
     * @param {string} edid ignored
     * @param {string} mediaid the picked media ID
     */
    mediaSelect(edid, mediaid) {
        this.$form.find('[name="src"]').val(mediaid);
    }
}
