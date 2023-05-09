jQuery(document).on('PROSEMIRROR_API_INITIALIZED', () => {
    // define diagrams schema
    window.Prosemirror.pluginSchemas.push((nodes, marks) => {
        nodes = nodes.addToEnd('diagrams', {
            inline: true,
            contenteditable: true,
            selectable: true,
            attrs: {
                data: {},
                id: {},
                title: {default: null},
                width: {default: null},
                height: {default: null},
                align: {default: ''}
            },
            group: "inline",
            draggable: false,
            toDOM: function toDOM(node) {
                const ref = node.attrs;
                const data = ref.data;
                const id = ref.id;
                const width = ref.width;
                const height = ref.height;
                const title = ref.title;
                let alignclass = ref.align;

                if (alignclass.length != 0) {
                    alignclass = ` media${alignclass}`;
                }

                return [
                    'object',
                    {
                        type: 'image/svg+xml',
                        class: 'media diagrams-svg' + alignclass,
                        title: title,
                        data: data,
                        'data-id': id,
                        width: width,
                        height: height,
                    }
                ]
            }
        });
        return {nodes, marks};
    });

    // extend plugin menu
    const AbstractMenuItemDispatcher = window.Prosemirror.classes.AbstractMenuItemDispatcher;
    const MenuItem = window.Prosemirror.classes.MenuItem;
    const KeyValueForm = window.Prosemirror.classes.KeyValueForm;
    const AbstractNodeView = window.AbstractNodeView;

    /* DOKUWIKI:include script/DiagramsForm.js */
    /* DOKUWIKI:include script/DiagramsView.js */
    /* DOKUWIKI:include script/DiagramsMenuItemDispatcher.js */


    window.Prosemirror.pluginNodeViews.diagrams = function diagrams(node, outerview, getPos) {
        return new DiagramsView(node, outerview, getPos);
    };

    window.Prosemirror.pluginMenuItemDispatchers.push(DiagramsMenuItemDispatcher);
});
