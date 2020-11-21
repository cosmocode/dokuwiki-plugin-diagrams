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
        $controller->register_hook('MENU_ITEMS_ASSEMBLY', 'AFTER', $this, 'addCreateButton');
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

    /**
     * Add "create diagram" to page tools menu
     *
     * @param Doku_Event $event
     */
    public function addCreateButton(Doku_Event $event)
    {
        if ($event->data['view'] != 'page') return;
        array_splice($event->data['items'], -1, 0, [new dokuwiki\plugin\drawio\MenuItem()]);
    }
}
