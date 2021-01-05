jQuery( function() {
    /* DOKUWIKI:include script/helpers.js */
    /* DOKUWIKI:include script/service.js */
    /* DOKUWIKI:include script/elements.js */

    // add diagram edit button to all SVGs included in wiki pages
    const $images = jQuery( 'img, object' ).filter( '.media, .medialeft, .mediacenter, .mediaright' );

    // collect image IDs with file extension
    const imageIds = $images.map(function (key, image) {
        return extractIdFromMediaUrl(image.currentSrc);
    }).toArray();

    let ajaxData = {};
    ajaxData['call'] = 'plugin_drawio';
    ajaxData['images'] = imageIds;

    // callback to attach buttons to editable diagrams
    const attachButtons = function (result) {
        const diagrams = JSON.parse(result);
        $images.each( function() {
            const current = jQuery( this );
            // FIXME what is the difference?
            const src = this.nodeName === 'OBJECT' ? current.attr( 'data' ) : current.attr( 'src' );

            const id = extractIdFromMediaUrl(src);
            if (diagrams.includes(id)) {
                let $editButton = editDiagramButton(id);
                if( current.parent()[0].nodeName === 'A' ) {
                    current.parent().after( "<br>", $editButton );
                } else {
                    current.after( "<br>", $editButton );
                }
            }
        } );
    };

    // query backend about permissions and SVG properties before attaching edit buttons
    jQuery.get(
        DOKU_BASE + 'lib/exe/ajax.php',
        ajaxData,
        attachButtons
    );

    /**
     * Media manager
     */
    const $mm_page = jQuery('#mediamanager__page');
    const $mm_popup = jQuery('#media__manager');
    if (!$mm_page.length && !$mm_popup.length) return;

    const $mm_tree = jQuery("#media__tree");
    $mm_tree.prepend(newDiagramForm());

    // update diagram NS when clicking in media tree
    $mm_tree.find('a.idx_dir').each(function (e) {
        const $this = jQuery( this );
        $this.on('click', function (e) {
            e.preventDefault();

            const $nsSpan = jQuery('#drawio__current-ns');
            $nsSpan.text(extractNs(e.target));
        });
    });

    // FIXME
    if (!$mm_page.length) return;
    // attach edit button to detail view of SVG files
    $mm_page.on('click', '.panel.filelist .panelContent a', function (e) {

        // observe div.file for mutations
        const $df = jQuery('div.file');
        const targetNode = $df[0];

        // observe the target node descendants
        const config = { childList: true, subtree: true };

        // add edit diagram  button to file actions
        const addEditButton = function(mutationsList, observer) {
            for(let mutation of mutationsList) {
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
} );
