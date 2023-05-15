<?php

use dokuwiki\plugin\diagrams\Diagrams;

/**
 * Action component of diagrams plugin
 *
 * This handles operations related to mediafile based diagrams
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class action_plugin_diagrams_mediafile extends DokuWiki_Action_Plugin
{

    /** @var helper_plugin_diagrams */
    protected $helper;

    /** @inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        // only register if mediafile mode is enabled
        if (!($this->getConf('mode') & Diagrams::MODE_MEDIA)) return;

        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleEditCheck');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleNamespaceCheck');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleIsDiagramCheck');
        $controller->register_hook('MEDIA_SENDFILE', 'BEFORE', $this, 'handleCSP');

        $this->helper = plugin_load('helper', 'diagrams');
    }

    /**
     * Check all supplied diagrams and return only editable diagrams
     *
     * @param Doku_Event $event AJAX_CALL_UNKNOWN
     */
    public function handleEditCheck(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_mediafile_editcheck') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $diagrams = (array)json_decode($INPUT->str('diagrams'));

        $editable = [];
        foreach ($diagrams as $image) {
            $image = cleanID($image);
            $file = mediaFN($image);

            if (
                file_exists($file) &&
                auth_quickaclcheck($image) >= AUTH_UPLOAD &&
                $this->helper->isDiagramFile($file)
            ) {
                $editable[] = $image;
            }
        }

        echo json_encode($editable);
    }

    /**
     * Check if the given media ID is a diagram
     *
     * @param Doku_Event $event AJAX_CALL_UNKNOWN
     */
    public function handleIsDiagramCheck(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_mediafile_isdiagramcheck') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $diagram = $INPUT->str('diagram');

        $file = mediaFN(cleanID($diagram));
        if (!file_exists($file)) {
            http_status(404);
            echo 0;
            return;
        }

        if (!$this->helper->isDiagramFile($file)) {
            http_status(403);
            echo 0;
        }

        echo 1;
    }

    /**
     * Check ACL for supplied namespace
     *
     * @param Doku_Event $event AJAX_CALL_UNKNOWN
     */
    public function handleNamespaceCheck(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_mediafile_nscheck') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $ns = $INPUT->str('ns');

        echo json_encode(auth_quickaclcheck($ns . ':*') >= AUTH_UPLOAD);
    }

    /**
     * Add CSP img-src directive to allow loading images from data source
     *
     * @param Doku_Event $event MEDIA_SENDFILE
     */
    public function handleCSP(Doku_Event $event)
    {
        if ($event->data['ext'] === 'svg' && $this->helper->isDiagramFile($event->data['file'])) {
            $event->data['csp']['img-src'] = "self data:";
            $event->data['csp']['sandbox'] = "allow-popups allow-top-navigation allow-same-origin";
        }
    }
}
