<?php

if(!defined('DOKU_INC')) die();

class action_plugin_drawio extends DokuWiki_Action_Plugin {
    
    public function register(Doku_Event_Handler $controller) {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER',  $this, 'handle_started');
        $controller->register_hook('TEMPLATE_PAGETOOLS_DISPLAY', 'BEFORE', $this, 'add_button');
    }
   
    public function handle_started(Doku_Event $event, $param) {
        global $JSINFO;
        $JSINFO['iseditor'] = auth_quickaclcheck('*') >= AUTH_UPLOAD;
        $JSINFO['sectok'] = getSecurityToken();
    }

    public function add_button(Doku_Event $event, $param) {
        if($event->data['view'] == 'main') {
            array_splice($event->data['items'], -1, 0, [ 'add_diagram' => '<li><a href="#" class="action" id="drawio-newfile-create"><span>Neues Diagramm</span></a></li>' ]);
        }
    }
}
