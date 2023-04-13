/**
 * Returns a diagram creation form as jQuery object
 *
 * @returns {jQuery|HTMLElement}
 */
function newDiagramForm() {
    const $createForm = jQuery(
        '<div><form>' +
        '<p>' + LANG.plugins.diagrams.createIntro + ' <strong><span id="diagrams__current-ns">' +
        '</strong></span></p>' +
        '<input type="text" class="edit" name="diagrams-create-filename" id="diagrams__create-filename" />' +
        '<button id="diagrams__create" class="edit">' + LANG.plugins.diagrams.createButton + '</button>' +
        '</form></div>'
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

    const ns = jQuery('#diagrams__current-ns').html();
    const id = jQuery('#diagrams__create-filename').val();

    if (!validId(id)) {
        alert(LANG.plugins.diagrams.errorInvalidId);
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
        '<button type="submit" class="diagrams-btn" data-id="' +
        fullId +
        '">' + LANG.plugins.diagrams.editButton + '</button>'
    );
    jQuery( $editButton ).on( 'click', () => {
        const diagramsEditor = new DiagramsEditor(); // FIXME callback for refreshing the image needed
        diagramsEditor.editMediaFile(fullId);
    });

    return $editButton;
}

/**
 * Launch diagram editor's iframe
 */
const launchEditor = function(event) {
    const fullId = event.data.fullId;
    if (!jQuery('#diagrams-frame')[0]) {
        jQuery('body').append('<iframe id="diagrams-frame" style="border: 0;position: fixed; top: 0; left: 0; right:0; bottom: 0; width:100%; height:100%; z-index: 9999;"></iframe>');
        jQuery(window).on('message', {fullId: fullId}, handleServiceMessages);
        jQuery('#diagrams-frame').attr('src', JSINFO['plugins']['diagrams']['service_url']);
    }
};
