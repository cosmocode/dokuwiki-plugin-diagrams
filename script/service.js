/**
 * Handle messages from diagramming service
 *
 * @param event
 */
const handleServiceMessages = function( event ) {
    // get diagram info passed to the function
    const fullId = event.data.fullId;
    const {ns, id} = splitFullId(fullId);

    const msg = JSON.parse( event.originalEvent.data );
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
            JSON.stringify( {action: 'export', format: 'xmlsvg', spin: LANG.plugins.drawio.saving } ),
            '*'
        );
    } else if ( msg.event === 'export' ) {
        if ( msg.format !== 'svg' ) {
            alert( LANG.plugins.drawio.errorUnsupportedFormat );
        } else {
            const datastr = doctypeXML + '\n' +
                decodeURIComponent( atob( msg.data.split( ',' )[1] ).split( '' ).map( function( c ) {
                    return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
                } ).join( '' ) );
            jQuery.post( getLocalDiagramUrl(ns, id), datastr )
                .done( function() {
                    jQuery( window ).off( 'message', {fullId: fullId}, handleServiceMessages );
                    jQuery( '#drawio-frame' ).remove();
                    const url = new URL(location.href);
                    // media manager window should reflect selection in ns tree
                    if (jQuery('#mediamanager__page').length > 0) {
                        url.searchParams.set('ns', ns);
                    }
                    setTimeout( function() {
                        location.assign(url);
                    }, 200 );
                } ).fail( function() {
                alert( LANG.plugins.drawio.errorSaving );
            } );
        }
    } else if( msg.event === 'exit' ) {
        jQuery( window ).off( 'message', {fullId: fullId}, handleServiceMessages );
        jQuery( '#drawio-frame' ).remove();
    }
};
