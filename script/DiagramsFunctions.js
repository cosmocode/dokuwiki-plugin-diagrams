/**
 * Common functions for Diagrams scripts
 */
class DiagramsFunctions {
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
