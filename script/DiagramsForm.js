/**
 * ProseMirror Form for editing diagram attribute
 */
class DiagramsForm extends KeyValueForm {

    #attributes = {
        id: '',
        svg: '',
        type: '',
        title: '',
        url: '',
        width: null,
        height: null,
        align: ''
    };

    #onsubmitCB = null;
    #oncloseCB = null;

    /**
     * Initialize the KeyValue form with fields and event handlers
     */
    constructor(attributes, onsubmit, onclose = null) {
        const name = LANG.plugins.diagrams.formtitle;
        const fields = DiagramsForm.#getFields(attributes);

        super(name, fields);
        this.#attributes = {
            ...this.#attributes,
            ...attributes
        };
        this.#onsubmitCB = onsubmit;
        this.#oncloseCB = onclose;

        // attach handlers
        this.$form.on('submit', (event) => {
            event.preventDefault(); // prevent form submission
            this.#onsubmitCB(this.#attributes);
            this.hide(); // close dialog
        });


        this.$form.on('dialogclose', (event) => {
            if (this.#oncloseCB) this.#oncloseCB();
            this.destroy();
        });

        this.$form.on('change', 'input,select', this.updateInternalState.bind(this));

        this.#getButtonsMediaManager(this.#attributes);
        this.#getButtonsEditor(this.#attributes);

        this.updateFormState();
    }

    #getButtonsEditor(attributes) {
        if (attributes.type === 'embed' || attributes.id) {
            const editButton = document.createElement('button');
            editButton.className = 'diagrams-btn-edit';
            editButton.id = 'diagrams__btn-edit';
            editButton.innerText = LANG.plugins.diagrams.editButton;
            editButton.type = 'button';
            this.$form.find('fieldset').append(editButton);

            editButton.addEventListener('click', event => {
                event.preventDefault(); // prevent form submission

                if (attributes.type === 'mediafile') {
                    const diagramsEditor = new DiagramsEditor(this.onSavedMediaFile.bind(this, attributes.id));
                    diagramsEditor.editMediaFile(attributes.id);
                } else {
                    const diagramsEditor = new DiagramsEditor();
                    diagramsEditor.editMemory(attributes.url, this.onSaveEmbed.bind(this));
                }
            });
        }
    }

    #getButtonsMediaManager(attributes) {
        // media manager button
        if (attributes.type === 'mediafile') {
            const selectButton = document.createElement('button');
            selectButton.innerText = LANG.plugins.diagrams.selectSource;
            selectButton.className = 'diagrams-btn-select';
            selectButton.type = 'button';
            selectButton.addEventListener('click', () =>
                window.open(
                    `${DOKU_BASE}lib/exe/mediamanager.php?ns=${encodeURIComponent(JSINFO.namespace)}&onselect=dMediaSelect`,
                    'mediaselect',
                    'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes',
                )
            );
            this.$form.find('fieldset').prepend(selectButton);
            window.dMediaSelect = this.mediaSelect.bind(this); // register as global function
        }
    }

    /**
     * Define form fields depending on type
     * @returns {object}
     */
    static #getFields(attributes) {
        const fields = [
            {
                type: 'select', 'label': LANG.plugins.diagrams.alignment, 'name': 'align', 'options':
                    [
                        {value: '', label: ''},
                        {value: 'left', label: LANG.plugins.diagrams.left},
                        {value: 'right', label: LANG.plugins.diagrams.right},
                        {value: 'center', label: LANG.plugins.diagrams.center}
                    ]
            },
            {
                label: LANG.plugins.diagrams.title, name: 'title'
            }
        ];

        if (attributes.type === 'mediafile') {
            fields.unshift(
                {
                    label: LANG.plugins.diagrams.mediaSource,
                    name: 'id'
                }
            );
        }
        return fields;
    }

    /**
     * Updates the form to reflect the current internal attributes
     */
    updateFormState() {
        for (const [key, value] of Object.entries(this.#attributes)) {
            this.$form.find('[name="' + key + '"]').val(value);
        }
        this.updateInternalUrl();
    }

    /**
     * Update the internal attributes to reflect the current form state
     */
    updateInternalState() {
        for (const [key, value] of Object.entries(this.#attributes)) {
            const $elem = this.$form.find('[name="' + key + '"]');
            if ($elem.length) {
                this.#attributes[key] = $elem.val();
            }
        }
        this.updateInternalUrl();
    }

    /**
     * Calculate the Display URL for the current mediafile
     */
    updateInternalUrl() {
        if (this.#attributes.type === 'mediafile') {
            this.#attributes.url = `${DOKU_BASE}lib/exe/fetch.php?media=${this.#attributes.id}`;
        }
    }

    /**
     * After svaing a media file reload the src for all images using it
     *
     * @see https://stackoverflow.com/a/66312176
     * @param {string} mediaid
     * @returns {Promise<void>}
     */
    async onSavedMediaFile(mediaid) {
        const url = `${DOKU_BASE}lib/exe/fetch.php?cache=nocache&media=${mediaid}`;
        await fetch(url, {cache: 'reload', mode: 'no-cors'});
        document.body.querySelectorAll(`img[src='${url}']`)
            .forEach(img => img.src = url)
    }

    /**
     * Save an embedded diagram back to the editor
     */
    onSaveEmbed(svg) {
        const encSvg = this.bytesToBase64(new TextEncoder().encode(svg));
        this.#attributes.url = 'data:image/svg+xml;base64,' + encSvg;
        this.updateFormState();
        return true;
    }

    /**
     * Callback called from the media popup on selecting a file
     *
     * This is globally registered as window.dMediaSelect
     *
     * @param {string} edid ignored
     * @param {string} mediaid the picked media ID
     */
    async mediaSelect(edid, mediaid) {
        const response = await fetch(
            `${DOKU_BASE}lib/exe/ajax.php?call=plugin_diagrams_mediafile_isdiagramcheck&diagram=` +
            encodeURIComponent(mediaid),
            {
                method: 'POST',
                cache: 'no-cache',
            }
        );

        if (!response.ok) {
            alert(LANG.plugins.diagrams.mediafileIsNotDiagram);
            return;
        }

        this.#attributes.id = mediaid;
        this.updateFormState();
    }

    /**
     * UTF-8 safe Base64 encoder
     *
     * @see https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
     * @param bytes
     * @returns {string}
     */
    bytesToBase64(bytes) {
        const binString = String.fromCodePoint(...bytes);
        return btoa(binString);
    }
}
