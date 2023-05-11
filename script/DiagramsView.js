class DiagramsView extends AbstractNodeView {
  constructor(node, view, getPos) {
    super(node, view, getPos);
    this.dForm = new DiagramsForm('diagrams-form-view');
  }

  renderNode(attrs) {
    const dgrSchemaSpecs = this.node.type.spec.toDOM(this.node);
    this.dom = Object.assign(document.createElement(dgrSchemaSpecs[0]), dgrSchemaSpecs[1]);
  }

  selectNode() {
    this.dom.classList.add('ProseMirror-selectednode');

    this.dForm.setSource(this.node.attrs.id);
    this.dForm.setEditButtonUrl(this.node.attrs.id, this.node.attrs.data);
    // TODO
    // this.dForm.setWidth(this.node.attrs.width);
    // this.dForm.setHeight(this.node.attrs.height);
    this.dForm.setAlignment(this.node.attrs.align);

    this.dForm.show();

    const cleanAttrs = AbstractNodeView.unsetPrefixAttributes('data-resolved', { ...this.node.attrs });
    this.dForm.on('submit', DiagramsForm.resolveSubmittedLinkData(
      cleanAttrs,
      this.dForm,
      (newAttrs) => {
        this.renderNode(newAttrs);
        const nodeStartPos = this.getPos();

        this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
          nodeStartPos,
          null,
          newAttrs,
          this.node.marks,
        ));
        this.deselectNode();
      },
    ));
  }
  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    this.dForm.hide();
    this.dForm.off('submit');
    this.dForm.resetForm();
  }
}
