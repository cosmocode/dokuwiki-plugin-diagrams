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
      // media manager
      const selectButton = jQuery('<button>', {
        type: 'button',
      });
      selectButton.text(LANG.plugins.diagrams.selectSource);
      selectButton.on('click', DiagramsForm.openMediaManager);
      this.$form.find('fieldset').prepend(selectButton);
      window.dMediaSelect = this.mediaSelect.bind(this);
    }

    return this.instance;
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

      this.resolveImageAttributes(newAttrs, callback);
    };
  }

  static resolveImageAttributes(newAttrs, callback) {
    const ajaxEndpoint = `${DOKU_BASE}lib/exe/ajax.php`;
    const ajaxParams = {
      call: 'plugin_prosemirror',
      actions: ['resolveMedia'],
      attrs: newAttrs,
      id: JSINFO.id,
    };

    jQuery.get(
      ajaxEndpoint,
      ajaxParams,
    ).done((data) => {
      const resolvedAttrs = {
        ...newAttrs,
        'data-resolvedHtml': data.resolveMedia['data-resolvedHtml'],
      };
      callback(resolvedAttrs);
    }).fail((jqXHR, textStatus, errorThrown) => {
      let errorMsg = `There was an error resolving this image -- ${errorThrown}: ${textStatus}.`;
      if (window.SentryPlugin) {
        window.SentryPlugin.logSentryException(new Error('Ajax Request failed'), {
          tags: {
            plugin: 'prosemirror',
            id: JSINFO.id,
          },
          extra: {
            ajaxEndpoint,
            ajaxParams,
            textStatus,
            errorThrown,
          },
        });
        errorMsg += ' The error has been logged to Sentry.';
      }
      errorMsg += ' You may want to continue your work in the syntax editor.';
      jQuery('#draft__status').after(jQuery('<div class="error"></div>').text(errorMsg));
    });
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
