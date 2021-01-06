/**
 * Returns a diagram creation form as jQuery object
 *
 * @returns {jQuery|HTMLElement}
 */
function newDiagramForm() {
    const $createForm = jQuery(
        '<form style="padding: 0.5em;">' +
        '<div>' + LANG.plugins.drawio.createIntro + ' <strong><span id="drawio__current-ns">' +
        '</strong></span></div>' +
        '<input type="text" name="drawio-create-filename" id="drawio__create-filename" />' +
        '<button id="drawio__create">' + LANG.plugins.drawio.createButton + '</button>' +
        '</form>'
    );

    jQuery( $createForm ).on( 'submit', createDiagram );

    return $createForm;
}

/**
 * Launch the editor and create a new diagram
 *
 * @param event
 */
function createDiagram(event) {
    event.preventDefault();

    const ns = jQuery('#drawio__current-ns').html();
    const id = jQuery('#drawio__create-filename').val();

    if (!validId(id)) {
        alert(LANG.plugins.drawio.errorInvalidId);
        return;
    }

    const fullIdArray = [ns, id];
    launchEditor({data:{fullId: fullIdArray.join(':') + '.svg'}});
}

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
        '">' + LANG.plugins.drawio.editButton + '</button>'
    );
    jQuery( $editButton ).on( 'click', {fullId: fullId}, launchEditor );

    return $editButton;
}

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
