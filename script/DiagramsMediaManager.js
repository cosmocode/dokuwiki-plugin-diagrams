/**
 * Attaches diagram functionality in the MediaManager and MediaPopup
 */
class DiagramsMediaManager {

    /**
     * Attach the handlers
     */
    constructor() {
        const tree = document.querySelector('#media__tree');
        if (tree) {
            const createLink = document.createElement('a');
            createLink.addEventListener('click', this.#showCreationDialog.bind(this));
            createLink.className = 'plugin_diagrams_create';
            createLink.innerText = LANG.plugins.diagrams.createLink;
            createLink.href = '#';
            tree.prepend(createLink);
        }

        const filePanel = document.querySelector('#mediamanager__page .panel.file');
        if (filePanel) {
            const observer = new MutationObserver(this.#addEditButton);
            observer.observe(filePanel, {childList: true, subtree: true});
        }
    }

    /**
     * Observer callback to add the edit button in the detail panel of the media manager
     *
     * @param mutationsList
     * @param observer
     */
    async #addEditButton(mutationsList, observer) {
        for (let mutation of mutationsList) {
            // div.file has been filled with new content?
            if (mutation.type !== 'childList') continue;

            // is it an SVG file?
            const svgLink = mutation.target.querySelector('a.mf_svg');
            if (!svgLink) continue;

            const actionList = mutation.target.querySelector('ul.actions');
            if (actionList.querySelector('button.diagrams-btn')) continue; // already added

            // ensure media file is actually an editable diagram
            const response = await fetch(
                DOKU_BASE + 'lib/exe/ajax.php?call=plugin_diagrams_mediafile_editcheck&diagrams=' +
                encodeURIComponent(JSON.stringify([svgLink.innerText])),
                {
                    method: 'GET',
                    cache: 'no-cache',
                }
            );

            if (response.ok && (await response.json())[0] === svgLink.innerText) {
                const editButton = document.createElement('button');
                editButton.classList.add('diagrams-btn');
                editButton.innerText = LANG.plugins.diagrams.editButton;
                editButton.addEventListener('click', async () => {
                    const editor = new DiagramsEditor();
                    await editor.editMediaFile(svgLink.innerText);
                });
                actionList.appendChild(editButton);
            }
        }
    }

    /**
     * Show the dialog to create a new diagram
     *
     * Uses JQuery UI
     *
     * @param {Event} event
     * @returns {Promise<void>}
     */
    async #showCreationDialog(event) {
        event.preventDefault();
        event.stopPropagation();
        const namespace = this.#getNamespace();

        if (!await this.#checkACLs(namespace)) {
            alert(LANG.plugins.diagrams.createForbidden);
            return;
        }

        const $form = jQuery(this.#buildForm(namespace));
        $form.dialog({
            title: LANG.plugins.diagrams.createLink,
            width: 600,
            appendTo: '.dokuwiki',
            modal: true,
            close: function () {
                // do not reuse the dialog
                // https://stackoverflow.com/a/2864783
                jQuery(this).dialog('destroy').remove();
            }
        });
    }

    /**
     * Check if the user has the right to create a diagram in the given namespace
     *
     * @param {string} namespace
     * @returns {Promise<boolean>}
     */
    async #checkACLs(namespace) {
        const url = DOKU_BASE + 'lib/exe/ajax.php' +
            '?call=plugin_diagrams_mediafile_nscheck' +
            '&ns=' + encodeURIComponent(namespace);


        const response = await fetch(url, {
            cache: 'no-cache',
        });

        return response.json();
    }

    /**
     * Extract the namespace from the page
     *
     * @returns {string}
     */
    #getNamespace() {
        const fullScreenNS = document.querySelector('#mediamanager__page .panelHeader h3 strong');
        const popupNS = document.querySelector('#media__manager #media__ns');

        let namespace = '';
        if (fullScreenNS) {
            namespace = fullScreenNS.innerText;
        } else if (popupNS) {
            namespace = popupNS.innerText;
        } else {
            throw new Error('Could not find namespace'); //should not happen
        }

        // Media Manager encloses the root dir in [] so let's strip that
        // because it is not a real namespace
        return namespace.replace(/^:|\[.*\]$/, '');
    }

    /**
     * Create the form to ask for the diagram name
     * @param ns
     * @returns {HTMLDivElement}
     */
    #buildForm(ns) {
        const wrapper = document.createElement('div');
        const form = document.createElement('form');
        wrapper.appendChild(form);

        const intro = document.createElement('p');
        intro.innerText = LANG.plugins.diagrams.createIntro;
        const namespace = document.createElement('strong');
        namespace.innerText = ':'+ns;
        intro.appendChild(namespace);
        form.appendChild(intro);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit';
        input.name = 'diagrams-create-filename';
        form.appendChild(input);

        const button = document.createElement('button');
        button.innerText = LANG.plugins.diagrams.createButton;
        form.appendChild(button);

        form.addEventListener('submit', this.#createDiagram.bind(this, ns, input));
        return wrapper;
    }

    /**
     * Open the diagram editor for the given namespace and filename
     *
     * @param {string} namespace The current namespace
     * @param {HTMLInputElement} input The input element containing the filename
     * @param {Event} event
     */
    #createDiagram(namespace, input, event) {
        event.preventDefault();
        event.stopPropagation();

        const id = input.value;

        // check for validity
        if (id.length < 0 || !/^[\w][\w\.\-]*$/.test(id)) {
            alert(LANG.plugins.diagrams.errorInvalidId);
            return;
        }
        const svg = namespace + ':' + id + '.svg';

        const editor = new DiagramsEditor(() => {
            let url = new URL(window.location.href);
            url.searchParams.set('ns', namespace);
            // these will be ignored in the popup:
            url.searchParams.set('image', svg);
            url.searchParams.set('tab_details', 'view');
            url.searchParams.set('tab_files', 'files');
            window.location.href = url.toString();
        });
        editor.editMediaFile(svg);
    }
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
    new DiagramsMediaManager();
});
