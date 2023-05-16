<?php

/**
 * Action component of diagrams plugin
 *
 * This handles general operations independent of the configured mode
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class action_plugin_diagrams_action extends DokuWiki_Action_Plugin
{

    /**@inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('MEDIAMANAGER_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'checkConf');
        $controller->register_hook('PLUGIN_MOVE_HANDLERS_REGISTER', 'BEFORE', $this, 'registerMoveHandler');
    }

    /**
     * Registers our handler with the move plugin
     *
     * @param Doku_Event $event
     * @return void
     */
    public function registerMoveHandler(Doku_Event $event)
    {
        $event->data['handlers']['diagrams_mediafile'] = [new \syntax_plugin_diagrams_mediafile(), 'handleMove'];
    }

    /**
     * Add data to JSINFO
     *
     * full service URL
     * digram mode
     * security token used for uploading
     *
     * @param Doku_Event $event DOKUWIKI_STARTED|MEDIAMANAGER_STARTED
     */
    public function addJsinfo(Doku_Event $event)
    {
        global $JSINFO;
        $JSINFO['sectok'] = getSecurityToken();
        $JSINFO['plugins']['diagrams'] = [
            'service_url' => $this->getConf('service_url'),
            'mode' => $this->getConf('mode'),
        ];
    }

    /**
     * Check if DokuWiki is properly configured to handle SVG diagrams
     *
     * @param Doku_Event $event DOKUWIKI_STARTED
     */
    public function checkConf(Doku_Event $event)
    {
        $mime = getMimeTypes();
        if (!array_key_exists('svg', $mime) || $mime['svg'] !== 'image/svg+xml') {
            msg($this->getLang('missingConfig'), -1);
        }
    }



}
