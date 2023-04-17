<?php

/**
 * Action component of diagrams plugin
 *
 */
class action_plugin_diagrams_mediafile extends DokuWiki_Action_Plugin
{

    /**
     * Registers a callback function for a given event
     *
     * @param \Doku_Event_Handler $controller
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleEditCheck');
    }

    /**
     * Check all supplied diagrams and return only editable diagrams
     *
     * @param Doku_Event $event
     */
    public function handleEditCheck(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_mediafile_editcheck') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $diagrams = (array) json_decode($INPUT->str('diagrams'));

        /** @var helper_plugin_diagrams $helper */
        $helper = plugin_load('helper', 'diagrams');

        $editable = [];
        foreach ($diagrams as $image) {
            $image = cleanID($image);
            $file = mediaFN($image);

            if (
                file_exists($file) &&
                auth_quickaclcheck($image) >= AUTH_UPLOAD &&
                $helper->isDiagramFile($file)
            ) {
                $editable[] = $image;
            }
        }

        echo json_encode($editable);
    }

}
