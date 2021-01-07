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
    const diagrams = jQuery( '#diagrams-frame' )[0].contentWindow;
    if( msg.event === 'init' ) {
        // try loading existing diagram file
        jQuery.get(DOKU_BASE + 'lib/exe/fetch.php?media=' + fullId, function (data) {
            diagrams.postMessage(JSON.stringify({action: 'load', xml: data}), '*');
        }, 'text')
            .fail(function () { // catch 404, file does not yet exist locally
                diagrams.postMessage(JSON.stringify({action: 'load', xml: ''}), '*');
            });
    } else if ( msg.event === 'save' ) {
        diagrams.postMessage(
            JSON.stringify( {action: 'export', format: 'xmlsvg', spin: LANG.plugins.diagrams.saving } ),
            '*'
        );
    } else if ( msg.event === 'export' ) {
        if ( msg.format !== 'svg' ) {
            alert( LANG.plugins.diagrams.errorUnsupportedFormat );
        } else {
            const datastr = doctypeXML + '\n' +
                decodeURIComponent( atob( msg.data.split( ',' )[1] ).split( '' ).map( function( c ) {
                    return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
                } ).join( '' ) );
            jQuery.post( getLocalDiagramUrl(ns, id), datastr )
                .done( function() {
                    jQuery( window ).off( 'message', {fullId: fullId}, handleServiceMessages );
                    jQuery( '#diagrams-frame' ).remove();
                    const url = new URL(location.href);
                    // media manager window should show current namespace
                    url.searchParams.set('ns', ns);
                    setTimeout( function() {
                        location.assign(url);
                    }, 200 );
                })
                .fail( function() {
                    alert( LANG.plugins.diagrams.errorSaving );
                });
        }
    } else if( msg.event === 'exit' ) {
        jQuery( window ).off( 'message', {fullId: fullId}, handleServiceMessages );
        jQuery( '#diagrams-frame' ).remove();
    }
};
