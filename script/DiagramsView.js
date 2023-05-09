class DiagramsView extends AbstractNodeView {
  constructor(node, view, getPos) {
    super(node, view, getPos);
    this.dForm = new DiagramsForm('diagrams-form-view');
  }

  renderNode(attrs) {
    const dgrSchemaSpecs = this.node.type.spec.toDOM(this.node);
    const fullAttrs = dgrSchemaSpecs[1];
    const container = document.createElement('div');
    container.setAttribute('class', 'diagrams-svg-wrapper');
    const ele = Object.assign(document.createElement(dgrSchemaSpecs[0]), fullAttrs);
    ele.setAttribute('class', fullAttrs.class);
    ele.setAttribute('data-id', fullAttrs['data-id']);
    ele.setAttribute('pointer-events', 'none');

    container.appendChild(ele);

    this.dom = container;

    DiagramsForm.resolveImageAttributes(attrs, (newAttrs) => {
      const nodeStartPos = this.getPos();
      this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
        nodeStartPos,
        null,
        newAttrs,
        this.node.marks,
      ));
    });
  }

  selectNode() {
    this.dom.classList.add('ProseMirror-selectednode');

    this.dForm.setSource(this.node.attrs.id);
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
