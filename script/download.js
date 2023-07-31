/**
 * Attach download and open buttons to diagrams
 */
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('div.diagrams-buttons').forEach(diagramActions => {
        $diagram = jQuery(diagramActions.parentNode.querySelector('object.diagrams-svg'));
        const url = $diagram.attr('data');

        let fileName = 'diagram';
        if (typeof $diagram.data('id') !== "undefined") {
            fileName = $diagram.data('id').split(':').pop();
        }
        // TODO num from section?

        // download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.setAttribute('download', fileName);
        const downloadButton = document.createElement('button');
        downloadButton.className = 'diagrams-btn';
        downloadButton.innerText = LANG.plugins.diagrams.downloadButtonShort;
        downloadButton.title = LANG.plugins.diagrams.downloadButton;

        const downloadIcon = DiagramsFunctions.getButtonIcon('download');
        downloadButton.prepend(downloadIcon);
        downloadLink.appendChild(downloadButton);
        diagramActions.prepend(downloadLink);

        // open
        const openButton = document.createElement('button');
        openButton.className = 'diagrams-btn';
        openButton.innerText = LANG.plugins.diagrams.openButtonShort;
        openButton.title = LANG.plugins.diagrams.openButton;

        const openIcon = DiagramsFunctions.getButtonIcon('open');
        openButton.prepend(openIcon);

        openButton.addEventListener('click', event => {
            event.preventDefault();
            window.location = url;
        });

        diagramActions.prepend(openButton);
    });
});


