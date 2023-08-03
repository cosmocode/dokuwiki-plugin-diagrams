/**
 * Attach download and open buttons to diagrams
 */
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('div.diagrams-buttons').forEach(diagramActions => {
        const $diagram = jQuery(diagramActions.parentNode.querySelector('object.diagrams-svg'));
        const url = $diagram.attr('data');
        const pngcache = $diagram.data('pngcache');

        // media files have an id, embedded diagrams don't
        let fileName = 'diagram';
        if (typeof $diagram.data('id') !== "undefined") {
            fileName = $diagram.data('id').split(':').pop();
        }

        // download
        diagramActions.prepend(DiagramsFunctions.getDownloadButton('svg', url, fileName));
        if (pngcache) {
            diagramActions.prepend(DiagramsFunctions.getDownloadButton('png', pngcache, fileName));
        }

        // open
        diagramActions.prepend(DiagramsFunctions.getOpenButton(url));
    });
});


