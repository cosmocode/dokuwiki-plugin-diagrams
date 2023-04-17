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
