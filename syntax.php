<?php

/**
 * Class syntax_plugin_diagrams
 */
class syntax_plugin_diagrams extends DokuWiki_Syntax_Plugin {

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
        $this->Lexer->addSpecialPattern('\{\{[^\}]+(?:\.svg)[^\}]*?\}\}',$mode,'plugin_diagrams');
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
        return Doku_Handler_Parse_Media($match);
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

        if(is_a($renderer, 'renderer_plugin_dw2pdf')) {
            $imageAttributes = array(
                'class'   => 'media',
                'src'     => ml($data['src']),
                'width'   => $data['width'],
                'height'  => $data['height'],
                'align'   => $data['align'],
                'title'   => $data['title']
            );
            $renderer->doc .= '<img '. buildAttributes($imageAttributes) . '/>';
        } else {
            $width = $data['width'] ? 'width="' . $data['width'] . '"' : '';
            $height = $data['height'] ? 'height="' . $data['height'] . '"' : '';
            $tag = '<object data="%s&cache=nocache" type="image/svg+xml" class="diagrams-svg media%s" %s %s></object>';
            $renderer->doc .= sprintf($tag, ml($data['src']), $data['align'], $width, $height);
        }

        return true;
    }
}
