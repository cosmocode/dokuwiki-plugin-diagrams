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
    /** @var helper_plugin_diagrams */
    protected $helper;

    /** @inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        // only register if embed mode is enabled
        if (!($this->getConf('mode') & Diagrams::MODE_EMBED)) return;

        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleLoad');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleSave');

        $this->helper = plugin_load('helper', 'diagrams');
    }

    /**
     * Load the SVG for an embedded diagram
     *
     * This locks the page for editing
     *
     * @param Doku_Event $event Event object AJAX_CALL_UNKNOWN
     */
    public function handleLoad(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_embed_load') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;

        $id = $INPUT->str('id');
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

        if (checklock($id)) {
            http_status(423, 'Page Locked');
            return;
        }

        $svg = rawWiki($id);
        $svg = substr($svg, $pos, $len);
        if (!$this->helper->isDiagram($svg)) {
            http_status(400);
            return;
        }

        lock($id); // FIXME we probably need some periodic lock renewal while editing?
        header('Content-Type: image/svg+xml');
        echo $svg;
    }

    /**
     * Save a new embedded diagram
     *
     * @param Doku_Event $event AJAX_CALL_UNKNOWN
     */
    public function handleSave(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_embed_save') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;

        $id = $INPUT->str('id');
        $svg = $INPUT->str('svg');
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

        if (!$this->helper->isDiagram($svg)) {
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

