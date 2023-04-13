<?php

use dokuwiki\plugin\diagrams\Diagrams;

/**
 * DokuWiki Plugin diagrams (Action Component)
 *
 * This handles loading and saving embedded diagrams
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class action_plugin_diagrams_embed extends \dokuwiki\Extension\ActionPlugin
{

    /** @inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        // only register if embed mode is enabled
        if (!$this->getConf('mode') & Diagrams::MODE_EMBED) return;

        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleLoad');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleSave');
    }

    /**
     * Load the SVG for an embedded diagram
     *
     * This locks the page for editing
     *
     * @see https://www.dokuwiki.org/devel:events:AJAX_CALL_UNKNOWN
     * @param Doku_Event $event Event object
     * @param mixed $param optional parameter passed when event was registered
     * @return void
     */
    public function handleLoad(Doku_Event $event, $param)
    {
        if ($event->data !== 'plugin_diagrams_embed_load') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;

        $id = $INPUT->str('id');
        $pos = $INPUT->int('pos');
        $len = $INPUT->int('len');

        if (auth_quickaclcheck($id) < AUTH_READ) { // FIXME should we check for EDIT perms on read as well?
            http_status(403);
            return;
        }

        if (!page_exists($id)) {
            http_status(404);
            return;
        }

        if (checklock($id)) {
            http_status(423, 'Page Locked');
            return;
        }
        lock($id); // FIXME we probably need some periodic lock renewal while editing?

        header('Content-Type: image/svg+xml');
        $svg = rawWiki($id);
        echo substr($svg, $pos, $len);
    }

    /**
     * Save a new embedded diagram
     *
     * @see https://www.dokuwiki.org/devel:events:AJAX_CALL_UNKNOWN
     * @param Doku_Event $event Event object
     * @param mixed $param optional parameter passed when event was registered
     * @return void
     */
    public function handleSave(Doku_Event $event, $param)
    {
        if ($event->data !== 'plugin_diagrams_embed_load') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;

        $id = $INPUT->str('id');
        $svg = $INPUT->str('svg'); // FIXME do we want to do any sanity checks on this?
        $pos = $INPUT->int('pos');
        $len = $INPUT->int('len');


        if (auth_quickaclcheck($id) < AUTH_EDIT) {
            http_status(403);
            return;
        }

        if (!page_exists($id)) {
            http_status(404);
            return;
        }

        if (!checkSecurityToken()) {
            http_status(403);
            return;
        }

        if (empty($svg) || substr($svg, 0, 4) !== '<svg') {
            http_status(400);
            return;
        }

        $original = rawWiki($id);
        $new = substr($original, 0, $pos) . $svg . substr($original, $pos + $len);
        saveWikiText($id, $new, $this->getLang('embedSaveSummary'));
        unlock($id);
        echo 'OK';
    }

}

