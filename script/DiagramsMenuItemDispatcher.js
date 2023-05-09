class DiagramsMenuItemDispatcher extends AbstractMenuItemDispatcher {
  static isAvailable(schema) {
    return !!schema.nodes.diagrams;
  }

  static getMenuItem(schema) {
    if (!this.isAvailable(schema)) {
      throw new Error('Diagrams is missing in provided Schema!');
    }

    return new MenuItem({
      command: (state, dispatch) => {
        const { $from } = state.selection;
        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, schema.nodes.diagrams)) {
          return false;
        }
        if (dispatch) {
          let textContent = '';
          state.selection.content().content.descendants((node) => {
            textContent += node.textContent;
            return false;
          });

          const dForm = new DiagramsForm('diagrams-form');
          if (textContent) {
              dForm.setSource(textContent);
          }

          dForm.show();

          dForm.on('submit', DiagramsForm.resolveSubmittedLinkData(
            {},
            dForm,
            (newAttrs) => {
              dispatch(state.tr.replaceSelectionWith(schema.nodes.diagrams.create(newAttrs)));
              dForm.off('submit');
              dForm.hide();
              dForm.resetForm();
            },
          ));
        }
        return true;
      },
      icon: document.createElement('span'), // FIXME
      label: LANG.plugins.diagrams['PMMenuItem'],
    });
  }
}
