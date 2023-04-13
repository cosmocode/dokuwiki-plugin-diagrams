jQuery(function () {
    /* DOKUWIKI:include script/DiagramsEditor.js */
    /* DOKUWIKI:include script/helpers.js */
    /* DOKUWIKI:include script/service.js */
    /* DOKUWIKI:include script/elements.js */
    /* DOKUWIKI:include script/mediamanager.js */

    // add diagram edit button to diagram SVGs included in wiki pages
    const $images = jQuery('object').filter('.diagrams-svg');

    // collect image IDs with file extension
    const imageIds = $images.map(function (key, image) {
        return extractIdFromMediaUrl(image.data);
    }).toArray();

    let ajaxData = {};
    ajaxData['call'] = 'plugin_diagrams_images';
    ajaxData['images'] = imageIds;

    // callback to attach buttons to editable diagrams
    const attachButtons = function (result) {
        const diagrams = JSON.parse(result);
        $images.each(function () {
            const id = extractIdFromMediaUrl(this.data);
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


});

// open links in diagrams in the browser window instead of SVG frame
jQuery(window).on('load', function() {
    jQuery('object.diagrams-svg').each( function() {
        jQuery(this.contentDocument).find('svg').find('a').attr({'target': '_parent', 'style': 'pointer-events: all;'});
    });
});
