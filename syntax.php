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
     * Render the diagram SVG as <object> instead of <img> to allow links
     *
     * @param string $format
     * @param Doku_Renderer $renderer
     * @param array $data
     * @return bool
     */
    public function render($format, Doku_Renderer $renderer, $data)
    {
        if ($format !== 'xhtml') return false;

        $renderer->doc .=
            '<object data="'
            . ml($data['src'])
            .'" type="image/svg+xml" class="diagrams-svg media'
            . $data['align']
            .'" ></object>';

        return true;
    }
}
