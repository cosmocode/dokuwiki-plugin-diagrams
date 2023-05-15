jQuery(document).on('PROSEMIRROR_API_INITIALIZED', () => {
    // define diagrams schema
    window.Prosemirror.pluginSchemas.push((nodes, marks) => {
        nodes = nodes.addToEnd('diagrams', {
            inline: true,
            selectable: true,
            attrs: {
                url: {},
                id: {},
                type: {default: 'mediafile'},
                title: {default: null},
                width: {default: null},
                height: {default: null},
                align: {default: ''}
            },
            group: "inline",
            draggable: false,

            /**
             * Render the node as HTML
             *
             * Maps node attributes to HTML attributes
             *
             * @param node
             * @returns {[string,object]}  [tagname, attributes]
             */
            toDOM: function toDOM(node) {
                let alignclass = node.attrs.align;
                if (alignclass.length !== 0) {
                    alignclass = ` media${alignclass}`;
                }

                return [
                    'img',
                    {
                        class: 'media diagrams-svg' + alignclass,
                        title: node.attrs.title,
                        src: node.attrs.url,
                        'data-id': node.attrs.id,
                        'data-type': node.attrs.type,
                        width: node.attrs.width,
                        height: node.attrs.height,
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
    const AbstractNodeView = window.AbstractNodeView; // FIXME this should be moved to the prosemirror.classes namespace

    /* DOKUWIKI:include script/DiagramsForm.js */
    /* DOKUWIKI:include script/DiagramsView.js */
    /* DOKUWIKI:include script/DiagramsMenuItemDispatcher.js */


    window.Prosemirror.pluginNodeViews.diagrams = function diagrams(node, outerview, getPos) {
        return new DiagramsView(node, outerview, getPos);
    };

    // noinspection JSBitwiseOperatorUsage
    if (JSINFO.plugins.diagrams && (JSINFO.plugins.diagrams.mode & 1)) {
        window.Prosemirror.pluginMenuItemDispatchers.push(DiagramsMenuItemDispatcherMediaFile);
    }

    // noinspection JSBitwiseOperatorUsage
    if (JSINFO.plugins.diagrams && (JSINFO.plugins.diagrams.mode & 2)) {
        window.Prosemirror.pluginMenuItemDispatchers.push(DiagramsMenuItemDispatcherEmbedded);
    }
});
