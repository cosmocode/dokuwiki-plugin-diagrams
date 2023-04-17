/**
 * Attach editing button to editable diagrams
 */
(function (){
    // check if the current page is editable by the current user
    if(!document.querySelector('head link[rel="edit"]')) return;

    document.querySelectorAll('.plugin_diagrams_embed').forEach(embed => {
        const button = document.createElement('button');
        button.className = 'diagrams-btn';
        button.innerText = LANG.plugins.diagrams.editButton;
        button.addEventListener('click', event => {
            event.preventDefault();
            const diagramsEditor = new DiagramsEditor(() => {
                window.location.reload();
            });
            diagramsEditor.editEmbed(
                JSINFO.id,
                parseInt(embed.getAttribute('data-pos')),
                parseInt(embed.getAttribute('data-len'))
            );
        });

        embed.appendChild(button);
    });
})();


