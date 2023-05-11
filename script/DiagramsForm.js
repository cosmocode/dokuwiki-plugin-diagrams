class DiagramsForm extends KeyValueForm {
    constructor(name = 'diagrams-form', fields = []) {
        if (fields.length === 0) {
            fields = [
                {
                    label: LANG.plugins.diagrams.mediaSource, name: 'src'
                },
                {
                    type: 'select', 'label': LANG.plugins.diagrams.alignment, 'options':
                        [
                            {name: 'alignment', value: 'left', label: LANG.plugins.diagrams.left},
                            {name: 'alignment', value: 'right', label: LANG.plugins.diagrams.right},
                            {name: 'alignment', value: 'center', label: LANG.plugins.diagrams.center}
                        ]
                }
            ];
        }

        super(name, fields);

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
                event.preventDefault();
                const diagramsEditor = new DiagramsEditor(async () => {
                    // relaod the image src for all images using it
                    // see https://stackoverflow.com/a/66312176
                    const url = editButton.getAttribute('data-url');
                    await fetch(url, {cache: 'reload', mode: 'no-cors'});
                    document.body.querySelectorAll(`img[src='${url}']`)
                        .forEach(img => img.src = url)
                });
                diagramsEditor.editMediaFile(editButton.getAttribute('data-id'));
            });
        }

        return this.instance;
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
        this.$form.find('[name="alignment"]').prop('selected', '');
        this.$form.find(`[name="alignment"][value="${align}"]`).prop('selected', 'selected');
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
            newAttrs.data = `${DOKU_BASE}lib/exe/fetch.php?cache=nocache&media=` + $diagramsForm.getSource();
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
