/**
 * Media manager
 */
(function () {
    /* are we in media manager context? */
    const $mm_page = jQuery('#mediamanager__page');
    const $mm_popup = jQuery('#media__manager');
    const isMMPage = $mm_page.length > 0;
    const isMMPopup = $mm_popup.length > 0;
    if (!isMMPage && !isMMPopup) return;

    /* in the namespace tree add a link to create a new diagram */
    const $mm_tree = jQuery("#media__tree");
    const $createLink = jQuery('<a id="plugin__diagrams-new" href="#">' + LANG.plugins.diagrams.createLink + '</a>')
        .on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            newDiagramForm().dialog({
                title: LANG.plugins.diagrams.createLink,
                width: 600,
                appendTo: '.dokuwiki',
                modal: true,
                open: function () {
                    const nsText = isMMPage ? jQuery('.panelHeader h3 strong').text() : jQuery('#media__ns').text();
                    const ns = cleanNs(nsText);
                    const $intro = jQuery('#diagrams__current-ns');
                    $intro.text(ns);

                    // check ACLs before displaying the form
                    let ajaxData = {};
                    ajaxData['call'] = 'plugin_diagrams_acl';
                    ajaxData['ns'] = ns;
                    jQuery.get(
                        DOKU_BASE + 'lib/exe/ajax.php',
                        ajaxData,
                        function (result) {
                            if (JSON.parse(result) !== true) {
                                $intro.after('<br>' + LANG.plugins.diagrams.createForbidden);
                                jQuery('#diagrams__create-filename').remove();
                                jQuery('#diagrams__create').remove();
                            }
                        }
                    );
                },
                close: function () {
                    // do not reuse the dialog
                    // https://stackoverflow.com/a/2864783
                    jQuery(this).dialog('destroy').remove();
                }
            });
        });
    $mm_tree.prepend($createLink);

// attach edit button to detail view of SVG files
    if (!isMMPage) return;
    $mm_page.on('click', '.filelist .panelContent a', function (e) {

        // observe div.file for mutations
        const $df = jQuery('div.file');
        const targetNode = $df[0];

        // observe the target node descendants
        const config = {childList: true, subtree: true};

        // add edit diagram  button to file actions
        const addEditButton = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                // div.file has been filled with new content (detail view)
                if (mutation.type === 'childList') {
                    const $svgLink = jQuery('a.mf_svg');
                    // only add buttons to SVG files
                    if ($svgLink.length !== 0) {
                        const $actionsList = jQuery('ul.actions');
                        // disconnect now so we don't observe the mutation we are about to trigger
                        observer.disconnect();
                        // FIXME why do they multiply when non-svg link is clicked before?!!!
                        if ($actionsList.find('button.diagrams-btn').length === 0) {
                            $actionsList.append(editDiagramButton($svgLink.html()));
                        }
                    }
                }
            }
        };

        const observer = new MutationObserver(addEditButton);
        observer.observe(targetNode, config);
    });
})();
