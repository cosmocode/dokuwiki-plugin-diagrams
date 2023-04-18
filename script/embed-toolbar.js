/**
 * Integrate diagrams editing into the editor
 *
 * This requires some global code that's executed early (not in document.ready)
 */
if (typeof window.toolbar !== 'undefined') {
    /**
     * Select the diagram at the current cursor position
     *
     * @param area
     * @returns {selection_class}
     */
    function selectDiagram(area) {
        const selection = DWgetSelection(area);
        const open = '<diagram';
        const close = '</diagram>';
        const min = 0;
        const max = area.value.length;

        // we ignore any selection and only use cursor position
        selection.end = selection.start;

        // potential boundaries
        const start = area.value.lastIndexOf(open, selection.start);
        const end = area.value.indexOf(close, selection.end);

        // boundaries of the previous and next elements of the same type
        const prev = area.value.lastIndexOf(close, selection.start - close.length);
        const next = area.value.indexOf(open, selection.start + open.length);

        // out of bounds?
        if (start < min) return selection;
        if (prev > -1 && prev > min && start < prev) return selection;
        if (end > max) return selection;
        if (next > -1 && next < end && end > next) return selection;

        // still here? we are inside a boundary, new selection
        selection.start = area.value.indexOf('>', start) + 1;
        selection.end = end;
        DWsetSelection(selection);
        return selection;
    }

    function addBtnActionDiagramsPlugin($btn, props, edid) {
        $btn.on('click', function (e) {
            e.preventDefault();
            const diagramsEditor = new DiagramsEditor();

            const area = document.getElementById(edid);
            const selection = selectDiagram(area);

            const origSvg = area.value.substring(selection.start, selection.end);

            diagramsEditor.editMemory(origSvg, svg => {
                if (!origSvg) {
                    // if this is a new diagram, wrap it in a <diagram> tag
                    svg = '<diagram>' + svg + '</diagram>';
                }
                area.value = area.value.substring(0, selection.start) +
                    svg +
                    area.value.substring(selection.end, area.value.length);
                return true;
            });


        });
    }

    toolbar[toolbar.length] = {
        type: "DiagramsPlugin",
        title: LANG.plugins.diagrams.toolbarButton,
        icon: "../../plugins/diagrams/diagrams.png",
    };
}
