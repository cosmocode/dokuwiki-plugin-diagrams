/**
 * Attach download and open buttons to diagrams
 */
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('div.diagrams-buttons').forEach(diagramActions => {
        $diagram = jQuery(diagramActions.parentNode.querySelector('object.diagrams-svg'));
        const url = $diagram.attr('data');
        const cacheurl = $diagram.data('cached');

        let fileName = 'diagram';
        if (typeof $diagram.data('id') !== "undefined") {
            fileName = $diagram.data('id').split(':').pop();
        }

        // download
        diagramActions.prepend(DiagramsFunctions.getDownloadButton('SVG', url, fileName));
        if (cacheurl) {
            diagramActions.prepend(DiagramsFunctions.getDownloadButton('PNG', cacheurl, fileName));
        }

        // open
        diagramActions.prepend(DiagramsFunctions.getOpenButton(url));
    });
});


