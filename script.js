jQuery( function() {
    /* DOKUWIKI:include script/helpers.js */
    /* DOKUWIKI:include script/service.js */

    /**
     * Launch diagram editor's iframe
     */
    const launchEditor = function(event) {
        const fullId = event.data.fullId;
        if (!jQuery('#drawio-frame')[0]) {
            jQuery('body').append('<iframe id="drawio-frame" style="border: 0;position: fixed; top: 0; left: 0; right:0; bottom: 0; width:100%; height:100%; z-index: 9999;"></iframe>');
            jQuery(window).on('message', {fullId: fullId}, handleServiceMessages);
            jQuery('#drawio-frame').attr('src', serviceUrl);
        }
    };

    // add diagram edit button to all SVGs included in wiki pages
    if( JSINFO['iseditor'] ) {
        jQuery( 'img, object' ).filter( '.media, .medialeft, .mediacenter, .mediaright' ).add( 'iframe.svgpureinsert' ).each( function() {
            const current = jQuery( this );
            const src = this.nodeName === 'OBJECT' ? current.attr( 'data' ) : current.attr( 'src' );
            const extension = src.split( '.' ).pop().toLowerCase();
            if( extension === 'svg' ) {
                const editlink = '<br><button class="drawio-btn btn btn-default btn-xs" style="clear:both" data-id="' + src.split('media=')[1].split('&')[0] + '">Editieren</button>';
                if( current.parent()[0].nodeName === 'A' ) {
                    current.parent().after( editlink );
                } else {
                    current.after( editlink );
                }
            }
        } );
    }

    // attach diagram editing function to the button rendered on pages
    jQuery( 'button.drawio-btn' ).on( 'click', function () {
        const fullId = jQuery( this ).data( 'id' );
        launchEditor({data: {fullId: fullId}});
    });

    // create a new diagram, triggered by click on page tools item
    jQuery( 'a#drawio-newfile-create' ).on( 'click', function( e ) {
        e.preventDefault();
        const ns = NS;
        let id = prompt( 'Name des neuen Diagramms' );
        if( !validId(id) ) {
            alert( 'Dateiname ist leer oder enthält ungültige Zeichen' );
            return;
        }
        id += '.svg';
        const datastr = doctypeXML +
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1px" height="1px" version="1.1" content="&lt;mxfile userAgent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36&quot; version=&quot;7.9.5&quot; editor=&quot;www.draw.io&quot;&gt;&lt;diagram id=&quot;8c846276-93cf-00fc-3101-d1fabb6ae99a&quot; name=&quot;Seite-1&quot;&gt;dZHBEoIgEIafhrtCNXY2q0snD51JEJjQdRBH6+nTwIyxuLB8/7+7sCCSVsPJ0EZegHGNcMQGRA4I43iDd+M2kYcjSbJ3QBjFvGkBuXpyDyNPO8V4GxgtgLaqCWEBdc0LGzBqDPShrQQddm2o4CuQF1Sv6VUxK/0rttHCz1wJOXeOI6/caHEXBrra90OYlO/l5IrOtby/lZRB/4VIhkhqAKyLqiHleprtPDaXd/yjfu5teG1/JIzBUns8BB9Ishc=&lt;/diagram&gt;&lt;/mxfile&gt;" style="background-color: rgb(255, 255, 255);"><defs/><g transform="translate(0.5,0.5)"/></svg>';
        jQuery.post( getLocalDiagramUrl(ns, id), datastr )
            .done( function( response ) {
                if( response.error ) {
                    alert( 'Fehler beim Speichern: ' + response.error );
                } else {
                    alert( 'Diagramm ' + response.id + ' angelegt' );
                }
            } ).fail( function() {
                alert( 'Fehler beim Speichern' );
            } );
    } );

    /**
     * Launch the editor and create a new diagram
     *
     * @param event
     */
    function createDiagram(event) {
        event.preventDefault();

        let href;
        // get namespace selected in ns tree
        const $selectedNSLink = jQuery('.idx_dir.selected');
        if ($selectedNSLink && $selectedNSLink.length > 0) {
            href = $selectedNSLink.attr('href');
        } else {
            // FIXME url rewriting?
            href = location.href;
        }
        const ns = extractNs(href);
        const id = jQuery('#drawio__create-filename').val();

        if (!validId(id)) {
            alert('name is empty or contains invalid characters!');
            return;
        }

        const fullIdArray = [ns, id];
        launchEditor({data:{fullId: fullIdArray.join(':') + '.svg'}});
    }

    /**
     * returns a diagram creation form as jQuery object
     *
     * @returns {jQuery|HTMLElement}
     */
    function newDiagramForm() {
        const currentNs = extractNs(location.href);
        const $createForm = jQuery(
            '<form>' +
            '<p>Create draw.io diagram in current namespace <strong><span id="drawio__current-ns">' +
            currentNs +
            '</strong></span></p>' +
            '<input type="text" name="drawio-create-filename" id="drawio__create-filename" />' +
            '<button id="drawio__create">Create</button>' +
            '</form>'
        );

        jQuery( $createForm ).on( 'submit', createDiagram );

        return $createForm;
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

    /**
     * Returns an edit button with attached click handler that launches the editor
     *
     * @param fullId
     * @returns {jQuery|HTMLElement}
     */
    function editDiagramButton(fullId) {
        const $editButton = jQuery(
            '<button type="submit" class="drawio-btn" data-id="' +
            fullId +
            '">Edit diagram</button>'
        );
        jQuery( $editButton ).on( 'click', {fullId: fullId}, launchEditor );

        return $editButton;
    }



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
                        // FIXME WTF why do they multiply when non-svg link is clicked before?!!!
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
