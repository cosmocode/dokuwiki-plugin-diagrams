jQuery( document ).ready( function() {
    if( JSINFO['iseditor'] ) {
        jQuery( 'img, object' ).filter( '.media, .medialeft, .mediacenter, .mediaright' ).add( 'iframe.svgpureinsert' ).each( function() {
            var current = jQuery( this );
            var src = this.nodeName == 'OBJECT' ? current.attr( 'data' ) : current.attr( 'src' );
            var extension = src.split( '.' ).pop().toLowerCase(); 
            if( extension == 'svg' ) {
                var editlink = '<br><button class="drawio-btn btn btn-default btn-xs" style="clear:both" data-id="' + src.split('media=')[1].split('&')[0] + '">Editieren</button>';
                if( current.parent()[0].nodeName == 'A' ) {
                    current.parent().after( editlink );
                } else {
                    current.after( editlink );
                }
            }
        } );
    }

    jQuery( 'button.drawio-btn' ).on( 'click', function() {
        var drawio_url = 'https://www.draw.io/?embed=1&proto=json&spin=1';
        
        if( !jQuery( '#drawio-frame' )[0] ) {
            var fullId = jQuery( this ).data( 'id' );
            var id = fullId;
            var ns = '';
            var ext = id.split( '.' ).pop().toLowerCase();
            var idParts = id.split( ':' );
            if( idParts.length > 1 ) {
                ns = idParts[0];
                id = idParts.slice( 1 ).join( ':' );
            }
            jQuery( 'body' ).append( '<iframe id="drawio-frame" style="border: 0;position: fixed; top: 0; left: 0; right:0; bottom: 0; width:100%; height:100%; z-index: 9999;"></iframe>' );
            var onmessage = function( e ) {
                var msg = JSON.parse( e.originalEvent.data );
                var drawio = jQuery( '#drawio-frame' )[0].contentWindow;
                if( msg.event == 'init' ) {
                    jQuery.get( DOKU_BASE + 'lib/exe/fetch.php?media=' + fullId, function( data ) {
                        drawio.postMessage( JSON.stringify( {action: 'load', xml: data} ), '*' );
                    }, 'text' );
                } else if( msg.event == 'save' ) {
                    drawio.postMessage( JSON.stringify( {action: 'export', format: 'xmlsvg', spin: 'Speichern' } ), '*' );
                } else if( msg.event == 'export' ) {
                    if( msg.format != 'svg' ) {
                        alert( 'Nicht unterstützt!' );
                    } else {
                        var datastr = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
                            decodeURIComponent( atob( msg.data.split( ',' )[1] ).split( '' ).map( function( c ) {
                                return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
                            } ).join( '' ) );
                        jQuery.post( DOKU_BASE + 'lib/exe/ajax.php?call=mediaupload&ow=checked&ns=' + ns + '&qqfile=' + id + '&sectok=' + JSINFO['sectok'], datastr )
                            .done( function() {
                                jQuery( window ).off( 'message', onmessage );
                                jQuery( '#drawio-frame' ).remove();
                                setTimeout( function() {
                                    location.reload();
                                }, 200 );
                            } ).fail( function() {
                                alert( 'Fehler beim Speichern' );
                            } );
                    }
                } else if( msg.event == 'exit' ) {
                    jQuery( window ).off( 'message', onmessage );
                    jQuery( '#drawio-frame' ).remove();
                }
            };
            jQuery( window ).on( 'message', onmessage );
            jQuery( '#drawio-frame' ).attr( 'src', drawio_url );
        }
    } );

    jQuery( 'a#drawio-newfile-create' ).on( 'click', function( e ) {
        e.preventDefault();
        var ns = NS;
        var id = prompt( 'Name des neuen Diagramms' );
        if( !/^[\w][\w\.\-]*$/.test( id ) ) {
            alert( 'Dateiname enthält ungültige Zeichen' );
            return;
        }
        id += '.svg';
        var datastr = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + 
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1px" height="1px" version="1.1" content="&lt;mxfile userAgent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36&quot; version=&quot;7.9.5&quot; editor=&quot;www.draw.io&quot;&gt;&lt;diagram id=&quot;8c846276-93cf-00fc-3101-d1fabb6ae99a&quot; name=&quot;Seite-1&quot;&gt;dZHBEoIgEIafhrtCNXY2q0snD51JEJjQdRBH6+nTwIyxuLB8/7+7sCCSVsPJ0EZegHGNcMQGRA4I43iDd+M2kYcjSbJ3QBjFvGkBuXpyDyNPO8V4GxgtgLaqCWEBdc0LGzBqDPShrQQddm2o4CuQF1Sv6VUxK/0rttHCz1wJOXeOI6/caHEXBrra90OYlO/l5IrOtby/lZRB/4VIhkhqAKyLqiHleprtPDaXd/yjfu5teG1/JIzBUns8BB9Ishc=&lt;/diagram&gt;&lt;/mxfile&gt;" style="background-color: rgb(255, 255, 255);"><defs/><g transform="translate(0.5,0.5)"/></svg>';
        jQuery.post( DOKU_BASE + 'lib/exe/ajax.php?call=mediaupload&ns=' + ns + '&qqfile=' + id + '&sectok=' + JSINFO['sectok'], datastr )
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
} );