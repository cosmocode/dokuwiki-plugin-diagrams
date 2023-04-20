<?php

use dokuwiki\plugin\diagrams\Diagrams;

/**
 * DokuWiki Plugin diagrams (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class syntax_plugin_diagrams_embed extends syntax_plugin_diagrams_mediafile
{
    /** @var int count the current embedded diagram */
    protected $count = 0;

    /** @inheritDoc */
    public function connectTo($mode)
    {
        // only register if embed mode is enabled
        if (!($this->getConf('mode') & Diagrams::MODE_EMBED)) return;
        $this->Lexer->addSpecialPattern('<diagram(?: .*?)?>.*?(?:</diagram>)', $mode, 'plugin_diagrams_embed');
    }

    /** @inheritDoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        [$open, $rest] = sexplode('>', $match, 2);
        $params = substr($open, 9);
        $svg = substr($rest, 0, -10);

        // embed positions
        $svglen = strlen($svg);
        $svgpos = $pos + strpos($match, '>');

        /** @var helper_plugin_diagrams $helper */
        $helper = plugin_load('helper', 'diagrams');
        if (!$helper->isDiagram($svg)) return false;

        $data = [
            'svg' => $svg,
            'align' => '',
            'width' => '',
            'height' => '',
            'pos' => $svgpos,
            'len' => $svglen,
        ];

        if (preg_match('/\b(left|right|center)\b/', $params, $matches)) {
            $data['align'] = $matches[1];
        }
        if (preg_match('/\b(\d+)x(\d+)\b/', $params, $matches)) {
            $data['width'] = (int)$matches[1];
            $data['height'] = (int)$matches[2];
        }

        return $data;
    }

    /** @inheritDoc */
    public function render($format, Doku_Renderer $renderer, $data)
    {
        if (!$data) return false;
        global $ID;
        global $INPUT;

        switch ($format) {
            case 'xhtml':
                // this references the diagram via the export_diagrams URL
                // this is used instead of inlining the SVG to be able to use a CSP header to prevent XSS
                $data['url'] = wl($ID, ['do' => 'export_diagrams', 'svg' => $this->count++], true, '&');
                parent::render($format, $renderer, $data);
                return true;
            case 'diagrams':
                // This exports a single SVG during the export_diagrams action
                if ($INPUT->int('svg') === $this->count++) {
                    $renderer->doc = $data['svg'];
                }
                return true;
        }
        return false;
    }


}

