/**
 * Open links in diagrams in the browser window instead of SVG frame
 *
 * FIXME wrapping the function in dokuwiki__content click handler
 * is necessary for releases up to Jack, because hovering over
 * section edit buttons used to remove handlers attached inside the section
 */
window.addEventListener('load', () => {
    // FIXME workaround wrapper
    document.querySelector('#dokuwiki__content').addEventListener('click', (event) => {
        jQuery('object.diagrams-svg').each(function () {
            jQuery(this.contentDocument).find('svg a').not('[target]').attr('target', '_top');
        });
    });

});
