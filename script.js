jQuery( function() {

    const serviceUrl = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1';
    const doctypeXML = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    // check if name/id of new diagram is valid
    function validId(id) {
        return id.length > 0 && /^[\w][\w\.\-]*$/.test( id )
    }

    // return URL to fetch existing diagram from DW
    function getLocalDiagramUrl(ns, id) {
        return DOKU_BASE + 'lib/exe/ajax.php?call=mediaupload&ow=true&ns=' + ns + '&qqfile=' + id + '&sectok=' + JSINFO['sectok'];
    }

    // split full id into ns and id parts
    function splitFullId(fullId) {
        let id = fullId;
        let ns = '';
        const idParts = id.split(':');
        if (idParts.length > 1) {
            ns = idParts[0];
            id = idParts.slice(1).join(':');
        }
         return {ns: ns, id: id};
    }

    /**
     * Launch diagram editor's iframe
     */
    const launchEditor = function(fullId) {
        if (!jQuery('#drawio-frame')[0]) {
            jQuery('body').append('<iframe id="drawio-frame" style="border: 0;position: fixed; top: 0; left: 0; right:0; bottom: 0; width:100%; height:100%; z-index: 9999;"></iframe>');
            jQuery(window).on('message', {fullId: fullId}, handleServiceMessages);
            jQuery('#drawio-frame').attr('src', serviceUrl);
        }
    };

    /**
     * Handle messages from diagramming service
     *
     * @param e
     */
    const handleServiceMessages = function( e ) {
        // get diagram info passed to the function
        const fullId = e.data.fullId;
        const {ns, id} = splitFullId(fullId);

        const msg = JSON.parse( e.originalEvent.data );
        const drawio = jQuery( '#drawio-frame' )[0].contentWindow;
        if( msg.event === 'init' ) {
            // try loading existing diagram file
            jQuery.get(DOKU_BASE + 'lib/exe/fetch.php?media=' + fullId, function (data) {
                drawio.postMessage(JSON.stringify({action: 'load', xml: data}), '*');
            }, 'text')
            .fail(function () { // catch 404, file does not exist yet locally
                drawio.postMessage(JSON.stringify({action: 'load', xml: ''}), '*');
            });
        } else if ( msg.event === 'save' ) {
            drawio.postMessage(
                JSON.stringify( {action: 'export', format: 'xmlsvg', spin: 'Speichern' } ),
                '*'
            );
        } else if ( msg.event === 'export' ) {
            if ( msg.format !== 'svg' ) {
                alert( 'Nicht unterstützt!' );
            } else {
                const datastr = doctypeXML + '\n' +
                    decodeURIComponent( atob( msg.data.split( ',' )[1] ).split( '' ).map( function( c ) {
                        return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
                    } ).join( '' ) );
                jQuery.post( getLocalDiagramUrl(ns, id), datastr )
                    .done( function() {
                        jQuery( window ).off( 'message', handleServiceMessages );
                        jQuery( '#drawio-frame' ).remove();
                        // media manager window should reflect selection in ns tree
                        const url = new URL(location.href);
                        url.searchParams.set('ns', ns);
                        setTimeout( function() {
                            location.assign(url);
                        }, 200 );
                    } ).fail( function() {
                    alert( 'Fehler beim Speichern' );
                } );
            }
        } else if( msg.event === 'exit' ) {
            jQuery( window ).off( 'message', handleServiceMessages );
            jQuery( '#drawio-frame' ).remove();
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
        launchEditor(fullId);
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
        // FIXME does this really work?
        // get namespace selected in ns tree
        $selectedNSLink = jQuery('.idx_dir.selected');
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
        launchEditor(fullIdArray.join(':') + '.svg');
    }

    // extract ns param from URL
    function extractNs(url) {
        urlParam = function(name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
            return results[1] || '';
        };
        return decodeURIComponent(urlParam('ns'));
    }

    // returns a diagram creation form as jQuery object
    function newDiagramForm() {
        currentNs = extractNs(location.href);
        $drawioCreateForm = jQuery(
            '<form>' +
            '<p>Create draw.io diagram in current namespace <strong><span id="drawio__current-ns">' +
            currentNs +
            '</strong></span></p>' +
            '<input type="text" name="drawio-create-filename" id="drawio__create-filename" />' +
            '<button id="drawio__create">Create</button>' +
            '</form>'
        );

        jQuery( $drawioCreateForm ).on( 'submit', createDiagram );

        return $drawioCreateForm;
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

    // TODO pop-up media manager
} );
