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
        if ($format === 'metadata') {
            $renderer->internalmedia($data['src']);
            return true;
        }
        if ($format !== 'xhtml') {
            return false;
        }

        if (is_a($renderer, 'renderer_plugin_dw2pdf')) {
            $imageAttributes = [
                'class' => 'media',
                'width' => $data['width'] ?: '',
                'height' => $data['height'] ?: '',
                'title' => $data['title'] ?: '',
                'align' => $data['align'],
                'src' => $data['url'],
            ];

            // if a PNG cache exists, use it instead of the real URL
            if (!$data['svg']) $data['svg'] = file_get_contents(mediaFN($data['src']));
            $cachefile = getCacheName($data['svg'], '.diagrams.png');
            if (file_exists($cachefile)) $imageAttributes['src'] = 'dw2pdf://' . $cachefile;

            $renderer->doc .= '<img ' . buildAttributes($imageAttributes) . '/>';
        } else {
            $wrapperAttributes = [];
            $wrapperAttributes['title'] = $data['title'] ?: '';
            $wrapperAttributes['class'] = 'media diagrams-svg-wrapper media' . $data['align'];
            $wrapperAttributes['style'] = '';
            if($data['width']) $wrapperAttributes['style'] .= 'width: ' . $data['width'] . 'px;';
            if($data['height']) $wrapperAttributes['style'] .= 'height: ' . $data['height'] . 'px;';

            $imageAttributes = [];
            $imageAttributes['class'] = 'diagrams-svg';
            $imageAttributes['data'] = $data['url'];
            $imageAttributes['data-id'] = cleanID($data['src']);
            $imageAttributes['type'] = 'image/svg+xml';
            $imageAttributes['data-pos'] = $data['pos'] ?: '';
            $imageAttributes['data-len'] = $data['len'] ?: '';

            $image = sprintf('<object %s></object>', buildAttributes($imageAttributes, true));
            $wrapper = sprintf('<div %s>%s</div>', buildAttributes($wrapperAttributes, true), $image);
            $renderer->doc .= $wrapper;
        }

        return true;
    }
}
