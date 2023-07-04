/* DOKUWIKI:include script/DiagramsEditor.js */
/* DOKUWIKI:include script/prosemirror.js */

// noinspection JSBitwiseOperatorUsage
if (JSINFO.plugins.diagrams && (JSINFO.plugins.diagrams.mode & 1)) {
    /* DOKUWIKI:include script/mediafile-editbutton.js */
    /* DOKUWIKI:include script/DiagramsMediaManager.js */
}

// noinspection JSBitwiseOperatorUsage
if (JSINFO.plugins.diagrams && (JSINFO.plugins.diagrams.mode & 2)) {
    /* DOKUWIKI:include script/embed-toolbar.js */
    /* DOKUWIKI:include script/embed-editbutton.js */
}

// open links in diagrams in the browser window instead of SVG frame
/* DOKUWIKI:include script/mediafile-linkfix.js */
