<?php

/**
 * Action component of diagrams plugin
 */
class action_plugin_diagrams extends DokuWiki_Action_Plugin
{

    /**
     * Registers a callback function for a given event
     *
     * @param \Doku_Event_Handler $controller
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('MEDIAMANAGER_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'checkConf');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjax');
    }

    /**
     * Add security token to JSINFO, used for uploading
     *
     * @param Doku_Event $event
     */
    public function addJsinfo(Doku_Event $event)
    {
        global $JSINFO;
        $JSINFO['sectok'] = getSecurityToken();
    }

    /**
     * Check if DokuWiki is properly configured to handle SVG diagrams
     *
     * @param Doku_Event $event
     */
    public function checkConf(Doku_Event $event)
    {
        $mime = getMimeTypes();
        if (!array_key_exists('svg', $mime) || $mime['svg'] !== 'image/svg+xml') {
            msg($this->getLang('missingConfig'), -1);
        }
    }

    /**
     * Check all supplied images and return only editable diagrams
     *
     * @param Doku_Event $event
     */
    public function handleAjax(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $images = $INPUT->arr('images');

        echo json_encode($this->editableDiagrams($images));
    }

    /**
     * Return an array of diagrams editable by the current user
     *
     * @param array $images
     * @return array
     */
    protected function editableDiagrams($images)
    {
        $editable = [];

        foreach ($images as $image) {
            if (auth_quickaclcheck($image) >= AUTH_UPLOAD && $this->isDiagram($image)) {
                $editable[] = $image;
            }
        }

        return $editable;
    }

    /**
     * Return true if the image is recognized as our diagram
     * based on content ('embed.diagrams.net' or 'draw.io')
     *
     * @param string $image image id
     * @return bool
     */
    protected function isDiagram($image)
    {
        global $conf;
        // strip nocache parameters from image
        $image = explode('&', $image);
        $image = $image[0];

        $file = DOKU_INC .
            $conf['savedir'] .
            DIRECTORY_SEPARATOR .
            'media' .
            DIRECTORY_SEPARATOR .
            preg_replace(['/:/'], [DIRECTORY_SEPARATOR], $image);

        $begin = file_get_contents($file, false, null, 0, 500);
        return strpos($begin, 'embed.diagrams.net') || strpos($begin, 'draw.io');
    }
}
