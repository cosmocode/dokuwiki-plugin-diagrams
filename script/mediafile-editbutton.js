/**
 * Attach editing button to media file diagrams in pages
 */
document.addEventListener('DOMContentLoaded', async () => {

    // get all diagrams images and their IDs
    const diagrams = document.querySelectorAll('object.diagrams-svg[data-id]');
    const diagramIDs = Array.from(diagrams).map(image => image.getAttribute('data-id'));

    // check which of the found diagrams are editable
    const body = new FormData();
    body.set('diagrams', JSON.stringify(diagramIDs));
    const result = await fetch(DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_mediafile_editcheck', {
        method: 'POST',
        cache: 'no-cache',
        body: body,
    });
    const editableDiagrams = await result.json();

    // add edit button to editable diagrams
    diagrams.forEach(image => {
        if (editableDiagrams.includes(image.getAttribute('data-id'))) {
            const button = document.createElement('button');
            button.className = 'diagrams-btn';
            button.innerText = LANG.plugins.diagrams.editButtonShort;
            button.title = LANG.plugins.diagrams.editButton;

            const icon = ButtonFunctions.getButtonIcon('edit');
            button.prepend(icon);

            button.addEventListener('click', event => {
                event.preventDefault();
                const diagramsEditor = new DiagramsEditor(() => {
                    // replace instead of reload to avoid accidentally re-submitting forms
                    window.location.replace(window.location.href);
                });
                diagramsEditor.editMediaFile(image.getAttribute('data-id'));
            });
            image.parentNode.querySelector('.diagrams-buttons').appendChild(button);
        }
    });
});
