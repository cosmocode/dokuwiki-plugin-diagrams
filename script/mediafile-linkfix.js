/**
 * Open links in diagrams in the browser window instead of SVG frame
 */
window.addEventListener('load', function () {
    /**
     * Sets _top target for links within SVG
     */
    function manipulateLinkTarget() {
        jQuery('object.diagrams-svg').each(function () {
            jQuery(this.contentDocument).find('svg a').not('[target]').attr('target', '_top');
        });
    }

    /* template agnostic selector */
    const observable = document.querySelector('body');

    const bodyObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type !== 'childList') continue;

            const nodes = mutation.addedNodes;

            nodes.forEach(node => {
                jQuery(node).find('object.diagrams-svg').each(function () {
                    // SVG clicks do not bubble up, so we use an available event
                    // FIXME this will not work on mobile devices
                    jQuery(this).on('mouseover', manipulateLinkTarget);
                });
            });
        }
    });

    /* rewrite link targets when document is initially loaded */
    manipulateLinkTarget();

    /**
     * Observe DOM changes
     *
     * FIXME this should no longer be necessary after Jack
     * @see https://github.com/dokuwiki/dokuwiki/pull/3957
     */
    bodyObserver.observe(observable, {
        attributes: true,
        childList: true,
        subtree: true }
    );
});
