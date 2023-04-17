<?php

use dokuwiki\Logger;
use dokuwiki\plugin\diagrams\Diagrams;
use enshrined\svgSanitize\Sanitizer;

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

        // auto load sanitizer
        require_once __DIR__ . '/../vendor/autoload.php';
        $this->Lexer->addSpecialPattern('<diagram(?: .*)?>.*?(?:</diagram>)', $mode, 'plugin_diagrams_embed');
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
        if(!$helper->isDiagram($svg)) return false;

        // sanitize svg
        $sanitizer = new Sanitizer();
        $svg = $sanitizer->sanitize($svg);

        if(!$svg) {
            global $ID;
            Logger::debug('diagrams: invalid SVG on '.$ID, $sanitizer->getXmlIssues());
            return false;
        }

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
        if ($format !== 'xhtml') return false;
        if(!$data) return false;

        $style = '';
        if($data['width'] && $data['height']) {
            $style .= 'width: ' . $data['width'] . 'px; ';
            $style .= 'height: ' . $data['height'] . 'px; ';
            $class = 'fixedSize';
        } else {
            $class = 'autoSize';
        }

        $attr = [
            'class' => "plugin_diagrams_embed $class media" . $data['align'],
            'style' => $style,
            'data-pos' => $data['pos'],
            'data-len' => $data['len'],
        ];

        $tag = '<div %s>%s</div>';
        $renderer->doc .= sprintf($tag, buildAttributes($attr), $data['svg']);

        return true;
    }
}

