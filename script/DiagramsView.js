class DiagramsView extends AbstractNodeView {
    constructor(node, view, getPos) {
        super(node, view, getPos);
        this.dForm = new DiagramsForm('diagrams-form-view');
    }

    renderNode(attrs) {
        const dgrSchemaSpecs = this.node.type.spec.toDOM(this.node);
        const elem = document.createElement(dgrSchemaSpecs[0]);

        Object.entries(dgrSchemaSpecs[1]).forEach(([key, value]) => {
            elem.setAttribute(key, value);
        });

        this.dom = elem;
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');

        this.dForm.updateFormFromView(this);
        this.dForm.show();
    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');
        this.dForm.hide();
        this.dForm.off('submit');
        this.dForm.resetForm();
    }

    /**
     * Dispatches a node update to the editor
     *
     * @param {object} newAttrs
     */
    dispatchNodeUpdate(newAttrs) {
        this.renderNode(newAttrs); // FIXME is this necessary?
        const nodeStartPos = this.getPos();

        this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
            nodeStartPos,
            null,
            newAttrs,
            this.node.marks,
        ));
    }
}
