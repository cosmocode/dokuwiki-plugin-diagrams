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
     * @returns {HTMLSpanElement}
     */
    static getButtonIcon(button) {
        const icon = document.createElement('span');
        icon.className = `icon-${button}`;

        switch (button) {
            case "open":
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" /></svg>';
                break;
            case "edit":
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>';
                break;
            case "download":
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" /></svg>';
                break;
        }

        return icon;
    }
}
