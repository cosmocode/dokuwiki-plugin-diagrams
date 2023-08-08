/**
 * Attach download and open buttons to diagrams
 */
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('div.diagrams-buttons').forEach(diagramActions => {
        const $diagram = jQuery(diagramActions.parentNode.querySelector('object.diagrams-svg'));
        const url = $diagram.attr('data');
        const pngcache = $diagram.data('pngcache');

        // media files have an id, embedded diagrams don't
        let media = '';
        if (typeof $diagram.data('id') !== "undefined") {
            media = $diagram.data('id');
        }

        // download
        diagramActions.prepend(ButtonFunctions.getDownloadButton('svg', url, media));
        if (pngcache) {
            diagramActions.prepend(ButtonFunctions.getDownloadButton('png', pngcache, media));
        }

        // open
        diagramActions.prepend(ButtonFunctions.getOpenButton(url));
    });
});
