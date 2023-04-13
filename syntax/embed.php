<?php

use dokuwiki\plugin\diagrams\Diagrams;

/**
 * DokuWiki Plugin diagrams (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class syntax_plugin_diagrams_embed extends \dokuwiki\Extension\SyntaxPlugin
{
    /** @inheritDoc */
    public function getType()
    {
        return 'substition';
    }

    /** @inheritDoc */
    public function getPType()
    {
        return 'block';
    }

    /** @inheritDoc */
    public function getSort()
    {
        return 319;
    }

    /** @inheritDoc */
    public function connectTo($mode)
    {
        // only register if embed mode is enabled
        if(!$this->getConf('mode') & Diagrams::MODE_EMBED) return;

        $this->Lexer->addSpecialPattern('<diagram(?: .*)?>.*?(?:</diagram>)', $mode, 'plugin_diagrams_embed');
    }

    /** @inheritDoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        [$open, $rest] = sexplode('>', $match, 2);
        $params = substr($open, 9);
        $svg = substr($rest, 0, -10);

        $data = [
            'svg' => $svg,
            'align' => '',
            'width' => '',
            'height' => '',
            'pos' => $pos,
            'len' => strlen($match),
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
        if ($format !== 'xhtml') return false;

        // FIXME currently insecure!
        // maybe use https://github.com/darylldoyle/svg-sanitizer

        $style = '';
        if ($data['width']) $style .= 'width: ' . $data['width'] . 'px; ';
        if ($data['height']) $style .= 'height: ' . $data['height'] . 'px; ';

        $tag = '<div class="plugin_diagrams_inline media%s" style="%s">%s</divobject>';
        $renderer->doc .= sprintf($tag, $data['align'], $style, $data['svg']);

        return true;
    }
}

