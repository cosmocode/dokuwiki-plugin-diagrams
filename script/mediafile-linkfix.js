/**
 * Open links in diagrams in the browser window instead of SVG frame
 */
window.addEventListener('load', () => {
    document.querySelectorAll('object.diagrams-svg svg a').forEach(link => {
        link.setAttribute('target', '_parent');
        link.setAttribute('style', 'pointer-events: all;');
    });
});
