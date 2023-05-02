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
        $this->Lexer->addSpecialPattern('\{\{[^\}]+(?:\.svg)[^\}]*?\}\}',$mode,'plugin_diagrams_mediafile');
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
            return $handler->media($match, $state, $pos);
        }

        $data['url'] = ml($data['src'], ['cache' => 'nocache'], true, '&');
        return $data;
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
        if ($format !== 'xhtml') return false;

        $imageAttributes = array(
            'class' => 'media',
            'width' => $data['width'] ?: '',
            'height' => $data['height'] ?: '',
            'title' => $data['title'],
        );


        if (is_a($renderer, 'renderer_plugin_dw2pdf')) {
            $imageAttributes['align'] = $data['align'];
            $imageAttributes['src'] = $data['url'];
            $renderer->doc .= '<img ' . buildAttributes($imageAttributes) . '/>';
        } else {
            $imageAttributes['class'] .= ' diagrams-svg';
            $imageAttributes['class'] .= ' media' . $data['align'];
            $imageAttributes['data'] = $data['url'];
            $imageAttributes['data-id'] = cleanID($data['src']);
            $imageAttributes['type'] = 'image/svg+xml';
            $imageAttributes['data-pos'] = $data['pos'] ?: '';
            $imageAttributes['data-len'] = $data['len'] ?: '';

            $tag = '<object %s></object>';
            $renderer->doc .= sprintf($tag, buildAttributes($imageAttributes, true));
        }

        return true;
    }
}
