/**
 * Prosemirror view for the diagrams node
 */
class DiagramsView extends AbstractNodeView {
    /** {DiagramsForm} The form to edit the node attributes */
    #dForm = null;


    /**
     * Render the node into this.dom
     *
     * We use the schema's spec.toDOM() method instead of directly using the passed attributes
     * to render the node to avoid code duplication and to have a central way to map node
     * attributes to dom attributes.
     *
     * @param {object} attrs
     */
    renderNode(attrs) {
        const schemaSpec = this.node.type.spec.toDOM(this.node);
        const elem = document.createElement(schemaSpec[0]);

        // copy attributes to dom element
        Object.entries(schemaSpec[1]).forEach(([key, value]) => {
            if (value) {
                elem.setAttribute(key, value);
            }
        });

        this.dom = elem;
    }

    /**
     * Handle node selection
     *
     * Update and show the form
     */
    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');

        this.#dForm = new DiagramsForm(
            this.node.attrs,
            this.dispatchNodeUpdate.bind(this),
            this.deselectNode.bind(this)
        );
        this.#dForm.show();
    }

    /**
     * Handle node deselection
     *
     * Closes the form
     */
    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');
    }

    /**
     * Dispatches a node update to the editor
     *
     * @param {object} newAttrs
     */
    dispatchNodeUpdate(newAttrs) {
        const nodeStartPos = this.getPos();
        this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
            nodeStartPos,
            null,
            newAttrs,
            this.node.marks,
        ));
    }
}
