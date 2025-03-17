<?php

use dokuwiki\plugin\diagrams\Diagrams;

/**
 * Class syntax_plugin_diagrams
 */
class syntax_plugin_diagrams_mediafile extends DokuWiki_Syntax_Plugin
{

    /**
     * @inheritdoc
     */
    public function getType()
    {
        return 'substition';
    }

    /**
     * @inheritdoc
     */
    public function getSort()
    {
        return 319;
    }

    /**
     * @inheritdoc
     */
    public function connectTo($mode)
    {
        // only register if mediafile mode is enabled
        if (!($this->getConf('mode') & Diagrams::MODE_MEDIA)) return;

        // grab all SVG images
        $this->Lexer->addSpecialPattern('\{\{[^\}]+(?:\.svg)[^\}]*?\}\}', $mode, 'plugin_diagrams_mediafile');
    }

    /**
     * Parse SVG syntax into media data
     *
     * @param string $match
     * @param int $state
     * @param int $pos
     * @param Doku_Handler $handler
     * @return array|bool
     */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        $data = Doku_Handler_Parse_Media($match);

        /** @var helper_plugin_diagrams $helper */
        $helper = plugin_load('helper', 'diagrams');
        if (!$data['type'] == 'internalmedia' || !$helper->isDiagramFile(mediaFN($data['src']))) {
            // This is not a local diagrams file, but some other SVG media file
            $handler->media($match, $state, $pos);
            return false;
        }

        $data['url'] = ml($data['src'], ['cache' => 'nocache'], true, '&');
        return $data;
    }

    /**
     * Handle rewrites made by the move plugin
     *
     * @param string $match
     * @param int $state
     * @param int $pos
     * @param string $plugin
     * @param helper_plugin_move_handler $handler
     * @return void
     */
    public function handleMove($match, $state, $pos, $plugin, $handler)
    {
        if ($plugin !== 'diagrams_mediafile') return;

        $handler->media($match, $state, $pos);
    }

    /**
     * Render the diagram SVG as <object> instead of <img> to allow links,
     * except when rendering to a PDF
     *
     * @param string $format
     * @param Doku_Renderer $renderer
     * @param array $data
     * @return bool
     */
    public function render($format, Doku_Renderer $renderer, $data)
    {
        global $conf;

        if ($format === 'metadata') {
            $renderer->internalmedia($data['src']);
            return true;
        }
        if ($format !== 'xhtml') {
            return false;
        }

        // check for cached PNG
        $cachefile = $this->getCachedPNG($data);

        if (is_a($renderer, 'renderer_plugin_dw2pdf')) {
            $imageAttributes = [
                'class' => 'media',
                'width' => empty($data['width']) ? '' : $data['width'],
                'height' => empty($data['height']) ? '' : $data['height'],
                'title' => $data['title'] ?? '',
                'alt' => $data['title'] ?? '',
                'align' => $data['align'],
                'src' => $data['url'],
            ];

            // if a PNG cache exists, use it instead of the real URL
            if ($cachefile) {
                $imageAttributes['src'] = 'dw2pdf://' . $cachefile;
            }

            $renderer->doc .= '<img ' . buildAttributes($imageAttributes) . '/>';
        } else {
            $wrapperAttributes = [];
            $wrapperAttributes['title'] = $data['title'] ?? '';
            $wrapperAttributes['class'] = 'media diagrams-svg-wrapper media' . $data['align'];

            $imageAttributes = [];
            $imageAttributes['class'] = "diagrams-svg";
            $imageAttributes['data'] = $data['url'];
            $imageAttributes['data-id'] = cleanID($data['src'] ?? '');
            $imageAttributes['type'] = 'image/svg+xml';
            $imageAttributes['data-pos'] = $data['pos'] ?? '';
            $imageAttributes['data-len'] = $data['len'] ?? '';
            $imageAttributes['width'] = empty($data['width']) ? '' : $data['width'];
            $imageAttributes['height'] = empty($data['height']) ? '' : $data['height'];

            if ($cachefile) {
                // strip cache dir and our cache extension from data attribute
                $imageAttributes['data-pngcache'] = str_replace([$conf['cachedir'], Diagrams::CACHE_EXT], '', $cachefile);
            }

            $image = sprintf('<object %s><span class="diagrams-alt">' . hsc($wrapperAttributes['title']) . '</span></object>', buildAttributes($imageAttributes, true));
            // wrapper for action buttons
            $actionButtons = '<div class="diagrams-buttons"></div>';
            $wrapper = sprintf('<div %s>%s%s</div>', buildAttributes($wrapperAttributes, true), $image, $actionButtons);
            $renderer->doc .= $wrapper;
        }

        return true;
    }

    /**
     * PNG cache file without extension, if caching is enabled and file exists.
     * Returns an empty string on older revisions (checking $REV), because
     * PNG caching does not support versioning.
     *
     * @param array $data
     * @return string
     */
    protected function getCachedPNG($data)
    {
        global $REV;

        if (!$this->getConf('pngcache') || $REV) return '';

        if (empty($data['svg'])) {
            $data['svg'] = file_get_contents(mediaFN($data['src']));
        }
        $cachefile = getCacheName($data['svg'], Diagrams::CACHE_EXT);
        if (file_exists($cachefile)) return $cachefile;

        return '';
    }
}
