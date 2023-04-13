<?php

/**
 * Action component of diagrams plugin
 *
 * FIXME move out all mediafile related stuff to a separate class and make it check the mode config
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
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjaxImages');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjaxAcl');
        $controller->register_hook('MEDIA_SENDFILE', 'BEFORE', $this, 'handleCSP');
    }

    /**
     * Add data to JSINFO: full service URL and security token used for uploading
     *
     * @param Doku_Event $event
     */
    public function addJsinfo(Doku_Event $event)
    {
        global $JSINFO;
        $JSINFO['sectok'] = getSecurityToken();
        $JSINFO['plugins']['diagrams']['service_url'] = $this->getConf('service_url');
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
    public function handleAjaxImages(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_images') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $images = $INPUT->arr('images');

        echo json_encode($this->editableDiagrams($images));
    }

    /**
     * Check ACL for supplied namespace
     *
     * @param Doku_Event $event
     */
    public function handleAjaxAcl(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_acl') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $ns = $INPUT->str('ns');

        echo json_encode(auth_quickaclcheck($ns . ':*') >= AUTH_UPLOAD);
    }

    /**
     * Add CSP img-src directive to allow loading images from data source
     *
     * @param Doku_Event $event
     * @return void
     */
    public function handleCSP(Doku_Event $event)
    {
        if ($this->isDiagram($event->data['media'])) {
            $event->data['csp']['img-src'] = "self data:";
            $event->data['csp']['sandbox'] = "allow-popups allow-top-navigation allow-same-origin";
        }
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
            if (auth_quickaclcheck(cleanId($image)) >= AUTH_UPLOAD && $this->isDiagram($image)) {
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

        // FIXME this should use mediaFN()
        $file = init_path(
            $conf['mediadir'] .
            DIRECTORY_SEPARATOR .
            preg_replace(['/:/'], [DIRECTORY_SEPARATOR], $image)
        );

        // FIXME replace with helper_plugin_diagrams::isDiagram()
        if (!is_file($file)) return false;
        $begin = file_get_contents($file, false, null, 0, 500);
        $confServiceUrl = $this->getConf('service_url'); // like "https://diagrams.xyz.org/?embed=1&..."
        $serviceHost = parse_url($confServiceUrl, PHP_URL_HOST); // Host-Portion of the Url, e.g. "diagrams.xyz.org"
        return strpos($begin, 'embed.diagrams.net') || strpos($begin, 'draw.io') || strpos($begin, $serviceHost);
    }
}
