class DiagramsMenuItemDispatcherMediaFile extends AbstractMenuItemDispatcher {

    static type = 'mediafile';

    static isAvailable(schema) {
        return !!schema.nodes.diagrams;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Diagrams is missing in provided Schema!');
        }

        return new MenuItem({
            command: (state, dispatch) => {
                const {$from} = state.selection;
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


                    const dForm = new DiagramsForm(
                        {
                            title: textContent ? textContent : '',
                            type: this.type,
                        },
                        (attributes) => {
                            dispatch(
                                state.tr.replaceSelectionWith(
                                    schema.nodes.diagrams.create(attributes)
                                )
                            )
                        }
                    );
                    dForm.show();
                }
                return true;
            },
            icon: document.createElement('span'), // FIXME
            label: LANG.plugins.diagrams['PMMenuItem-' + this.type],
        });
    }
}

class DiagramsMenuItemDispatcherEmbedded extends DiagramsMenuItemDispatcherMediaFile {
    static type = 'embed';
}
