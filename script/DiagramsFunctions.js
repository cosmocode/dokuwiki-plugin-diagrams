/**
 * Common functions for Diagrams scripts
 */
class DiagramsFunctions {

    static getDownloadButton(ext, url, fileName) {

        const button = document.createElement('button');
        button.className = 'diagrams-btn';

        const icon = DiagramsFunctions.getButtonIcon('download');
        button.prepend(icon);

        const link = document.createElement('a');

        if (ext === 'png') {
            button.append(LANG.plugins.diagrams.downloadPNGButtonShort);
            button.title = LANG.plugins.diagrams.downloadPNGButton;

            link.href = DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_pngdownload' +
                '&pngcache=' + encodeURIComponent(url) +
                '&filename=' + encodeURIComponent(fileName + '.' + ext);
            link.setAttribute('download', fileName + '.' + ext);
        } else {
            link.href = url;
            link.setAttribute('download', fileName);
            button.append(LANG.plugins.diagrams.downloadSVGButtonShort);
            button.title = LANG.plugins.diagrams.downloadSVGButton;
        }

        link.appendChild(button);

        return link;
    }

    static getOpenButton(url) {
        const button = document.createElement('button');
        button.className = 'diagrams-btn';
        button.innerText = LANG.plugins.diagrams.openButtonShort;
        button.title = LANG.plugins.diagrams.openButton;

        button.prepend(DiagramsFunctions.getButtonIcon('open'));

        button.addEventListener('click', event => {
            event.preventDefault();
            window.location = url;
        });

        return button;
    }

    /**
     * Icon HTML
     *
     * @param {String} button
     * @returns {HTMLImageElement}
     */
    static getButtonIcon(button) {
        const icon = document.createElement('img');
        icon.src = DOKU_BASE + `lib/plugins/diagrams/img/${button}.svg`;
        icon.className = `icon-${button}`;

        return icon;
    }
}
