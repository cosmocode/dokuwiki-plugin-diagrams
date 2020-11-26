<?php

class action_plugin_drawio extends DokuWiki_Action_Plugin
{

    /**
     * Registers a callback function for a given event
     *
     * @param \Doku_Event_Handler $controller
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'jsinfoEditPermissions');
    }

    /**
     * Add some permissions data to JSINFO
     *
     * @param Doku_Event $event
     */
    public function jsinfoEditPermissions(Doku_Event $event)
    {
        global $JSINFO;
        $JSINFO['iseditor'] = auth_quickaclcheck('*') >= AUTH_UPLOAD;
        $JSINFO['sectok'] = getSecurityToken();
    }
}
