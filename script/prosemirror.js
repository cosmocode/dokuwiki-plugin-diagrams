(async() => {
    while(!window.hasOwnProperty('Prosemirror'))
        await new Promise(resolve => setTimeout(resolve, 1000));

    window.Prosemirror.pluginSchemas.push((nodes, marks) => {
        nodes = nodes.addToEnd('diagrams', {
            inline: true,
            attrs: {
                src: {},
                id: {},
                title: {default: null},
                width: {default: null},
                height: {default: null},
                align: {default: ''}
            },
            group: "inline",
            draggable: true,
            toDOM: function toDOM(node) {
                const ref = node.attrs;
                const src = ref.src;
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
                        data: src,
                        'data-id': id,
                        width: width,
                        height: height,
                    }
                    ]
            }
        });
        return {nodes, marks};
    });

})();
