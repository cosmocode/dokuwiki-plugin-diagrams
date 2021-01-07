jQuery(function () {
    /* DOKUWIKI:include script/helpers.js */
    /* DOKUWIKI:include script/service.js */
    /* DOKUWIKI:include script/elements.js */

    // add diagram edit button to all SVGs included in wiki pages
    const $images = jQuery('img').filter('.media, .medialeft, .mediacenter, .mediaright');

    // collect image IDs with file extension
    const imageIds = $images.map(function (key, image) {
        return extractIdFromMediaUrl(image.src);
    }).toArray();

    let ajaxData = {};
    ajaxData['call'] = 'plugin_drawio';
    ajaxData['images'] = imageIds;

    // callback to attach buttons to editable diagrams
    const attachButtons = function (result) {
        const diagrams = JSON.parse(result);
        $images.each(function () {
            const id = extractIdFromMediaUrl(this.src);
            const $current = jQuery(this);
            if (diagrams.includes(id)) {
                let $editButton = editDiagramButton(id);
                if ($current.parent()[0].nodeName === 'A') {
                    $current.parent().after("<br>", $editButton);
                } else {
                    $current.after("<br>", $editButton);
                }
            }
        });
    };

    // query backend about permissions and SVG properties before attaching edit buttons
    jQuery.get(
        DOKU_BASE + 'lib/exe/ajax.php',
        ajaxData,
        attachButtons
    );

    /**
     * Media manager
     * FIXME this should be moved to a separate file
     */

    /* are we in media manager context? */
    const $mm_page = jQuery('#mediamanager__page');
    const $mm_popup = jQuery('#media__manager');
    const isMMPage = $mm_page.length > 0;
    const isMMPopup = $mm_popup.length > 0;
    if (!isMMPage && !isMMPopup) return;

    /* in the namespace tree add a link to create a new diagram */
    const $mm_tree = jQuery("#media__tree");
    const $createLink = jQuery('<a href="#">' + LANG.plugins.drawio.createLink + '</a>')
        .on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            newDiagramForm().dialog({
                title: LANG.plugins.drawio.createLink,
                width: 600,
                appendTo: '.dokuwiki',
                modal: true,
                open: function () {
                    const ns = isMMPage ? jQuery('.panelHeader h3 strong').text() : jQuery('#media__ns').text();
                    jQuery('#drawio__current-ns').text(ns);
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
    $mm_page.on('click', '.panel.filelist .panelContent a', function (e) {

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
                        if ($actionsList.find('button.drawio-btn').length === 0) {
                            $actionsList.append(editDiagramButton($svgLink.html()));
                        }
                    }
                }
            }
        };

        const observer = new MutationObserver(addEditButton);
        observer.observe(targetNode, config);
    });
});
