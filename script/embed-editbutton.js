/**
 * Attach editing button to editable diagrams
 */
document.addEventListener('DOMContentLoaded', () => {
    // check if the current page is editable by the current user
    if (!document.querySelector('head link[rel="edit"]')) return;

    document.querySelectorAll('object.diagrams-svg[data-pos]').forEach(embed => {
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
                // hash breaks replace, must be ignored
                window.location.replace(window.location.pathname + window.location.search);
            });
            diagramsEditor.editEmbed(
                JSINFO.id,
                parseInt(embed.getAttribute('data-pos')),
                parseInt(embed.getAttribute('data-len'))
            );
        });

        embed.parentNode.querySelector('.diagrams-buttons').appendChild(button);
    });
});
