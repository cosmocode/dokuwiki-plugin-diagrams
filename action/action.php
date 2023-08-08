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
    /** @var helper_plugin_diagrams */
    protected $helper;

    /**@inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('MEDIAMANAGER_STARTED', 'AFTER', $this, 'addJsinfo');
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'checkConf');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleCache');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handlePNGDownload');

        $this->helper = plugin_load('helper', 'diagrams');
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

    /**
     * Save the PNG cache of a diagram
     *
     * @param Doku_Event $event AJAX_CALL_UNKNOWN
     */
    public function handleCache(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_savecache') return;
        $event->preventDefault();
        $event->stopPropagation();

        // to not further complicate the JavaScript and because creating the PNG is essentially free,
        // we always create the PNG but only save it if the cache is enabled
        if (!$this->getConf('pngcache')) {
            echo 'PNG cache disabled, call ignored';
            return;
        }

        global $INPUT;

        $svg = $INPUT->str('svg'); // raw svg
        $png = $INPUT->str('png'); // data uri

        if (!checkSecurityToken()) {
            http_status(403);
            return;
        }

        if (!$this->helper->isDiagram($svg)) {
            http_status(400);
            return;
        }

        if (!preg_match('/^data:image\/png;base64,/', $png)) {
            http_status(400);
            return;
        }
        $png = base64_decode(explode(',', $png)[1]);

        if (substr($png, 1, 3) !== 'PNG') {
            http_status(400);
            return;
        }

        $cacheName = getCacheName($svg, '.diagrams.png');
        if (io_saveFile($cacheName, $png)) {
            echo 'OK';
        } else {
            http_status(500);
        }
    }

    /**
     * PNG download available via link created in JS (only if PNG caching is enabled)
     *
     * @param Doku_Event $event
     * @return void
     */
    public function handlePNGDownload(Doku_Event $event)
    {
        if ($event->data !== 'plugin_diagrams_pngdownload') return;
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        global $conf;

        $cacheName = $INPUT->str('pngcache');
        $media = cleanID($INPUT->str('media'));
        $id = cleanID($INPUT->str('id'));

        // check ACLs to original file or page
        if (
            ($id && auth_quickaclcheck($id) < AUTH_READ) ||
            ($media && auth_quickaclcheck($media) < AUTH_READ)
        ) {
            http_status(403);
            return;
        }

        // check if download target exists
        if (
            ($id && !page_exists($id)) ||
            ($media && !media_exists($media))
        ) {
            http_status(404);
            return;
        }

        // serve cached PNG file
        $file = $conf['cachedir'] . $cacheName . \dokuwiki\plugin\diagrams\Diagrams::CACHE_EXT;
        if (file_exists($file)) {
            // correct file extension
            $download = $media ? str_replace('.svg', '.png', $media) : $id . ".png";
            $download = noNS($download);
            header('Content-Type: image/png');
            header("Content-Disposition: attachment; filename=$download;");
            http_sendfile($file);
            readfile($file);
        } else {
            http_status(404);
        }
    }
}
