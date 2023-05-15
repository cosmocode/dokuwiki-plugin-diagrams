/**
 * Creates a menu entry to insert a new mediafile diagram
 */
class DiagramsMenuItemDispatcherMediaFile extends AbstractMenuItemDispatcher {
    /** The type of the node to be inserted */
    static type = 'mediafile';

    /**
     * Check if the schema is available
     *
     * @param schema
     * @returns {boolean}
     */
    static isAvailable(schema) {
        return !!schema.nodes.diagrams;
    }

    /**
     * Get the menu icon
     *
     * @todo the inline styles here should be part of the prosemirror plugin default styles
     * @returns {HTMLSpanElement}
     */
    static getIcon() {
        const svgIcon = document.createElement('img');
        svgIcon.src = DOKU_BASE + 'lib/plugins/diagrams/img/diagramsnet.svg';
        svgIcon.style.width = '1.2em';
        svgIcon.style.height = '1.2em';
        svgIcon.style.float = 'none';

        const wrapper = document.createElement('span');
        wrapper.appendChild(svgIcon);
        wrapper.className = 'menuicon';

        return wrapper;
    }

    /**
     * Return the menu item
     *
     * @param schema
     * @returns {MenuItem}
     */
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
            icon: this.getIcon(),
            label: LANG.plugins.diagrams['PMMenuItem-' + this.type],
        });
    }
}

/**
 * Creates a menu entry to insert a new embedded diagram
 */
class DiagramsMenuItemDispatcherEmbedded extends DiagramsMenuItemDispatcherMediaFile {
    static type = 'embed';
}
