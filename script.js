jQuery( function() {
    /* DOKUWIKI:include script/helpers.js */
    /* DOKUWIKI:include script/service.js */
    /* DOKUWIKI:include script/elements.js */

    // add diagram edit button to all SVGs included in wiki pages
    if( JSINFO['iseditor'] ) {
        jQuery( 'img, object' ).filter( '.media, .medialeft, .mediacenter, .mediaright' ).each( function() {
            const current = jQuery( this );
            const src = this.nodeName === 'OBJECT' ? current.attr( 'data' ) : current.attr( 'src' );
            const extension = src.split( '.' ).pop().toLowerCase();
            if( extension === 'svg' ) {
                let $editButton = editDiagramButton(src.split('media=')[1].split('&')[0]);
                if( current.parent()[0].nodeName === 'A' ) {
                    current.parent().after( "<br>", $editButton );
                } else {
                    current.after( "<br>", $editButton );
                }
            }
        } );
    }

    /**
     * Full-page media manager
     */
    const $mm_page = jQuery('#mediamanager__page');
    if (!$mm_page.length) return;

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

    // TODO pop-up media manager
} );
