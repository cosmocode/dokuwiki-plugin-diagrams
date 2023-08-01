/**
 * Common functions for Diagrams scripts
 */
class DiagramsFunctions {

    static getDownloadButton(ext, url, fileName) {
        const link = document.createElement('a');
        link.href = url;
        const button = document.createElement('button');
        button.className = 'diagrams-btn';
        if (ext === 'PNG') {
            link.setAttribute('download', fileName + '.png');
            button.innerText = LANG.plugins.diagrams.downloadPNGButtonShort;
            button.title = LANG.plugins.diagrams.downloadPNGButton;
        } else {
            link.setAttribute('download', fileName);
            button.innerText = LANG.plugins.diagrams.downloadSVGButtonShort;
            button.title = LANG.plugins.diagrams.downloadSVGButton;
        }

        const icon = DiagramsFunctions.getButtonIcon('download');
        button.prepend(icon);
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
