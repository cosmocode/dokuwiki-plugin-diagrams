<?php

/**
 * DokuWiki Plugin diagrams (Helper Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class helper_plugin_diagrams extends \dokuwiki\Extension\Plugin
{
    /**
     * Check if the given file is a diagrams.net diagram
     *
     * @param string $file
     * @return bool
     */
    public function isDiagramFile($file)
    {
        $svg = file_get_contents($file, false, null, 0, 500);
        return $this->isDiagram($svg);
    }

    /**
     * Check if the given SVG is a diagrams.net diagram
     *
     * This is done by ensuring that the service host is part of the SVG header
     *
     * @param string $svg The raw SVG data (first 500 bytes are enough)
     * @return bool
     */
    public function isDiagram($svg)
    {
        $svg = substr($svg, 0, 500); // makes checking a tiny bit faster
        $svg = preg_replace('/<\?xml.*?>/', '', $svg);
        $svg = preg_replace('/<!--.*?-->/', '', $svg);
        $svg = preg_replace('/<!DOCTYPE.*?>/', '', $svg);
        $svg = ltrim($svg);

        if (empty($svg) || substr($svg, 0, 4) !== '<svg') return false;
        $confServiceUrl = $this->getConf('service_url'); // like "https://diagrams.xyz.org/?embed=1&..."
        $serviceHost = parse_url($confServiceUrl, PHP_URL_HOST); // Host-Portion of the Url, e.g. "diagrams.xyz.org"
        return strpos($svg, 'embed.diagrams.net') || strpos($svg, 'draw.io') || strpos($svg, $serviceHost);
    }

    /**
     * Adds style node to render svg in dark theme
     *
     * @param string $svg The raw SVG data
     * @return string
     */
    public static function addDarkModeStyle(string $svg)
    {
        $svgAsXML = simplexml_load_string($svg);
        $svgAsXML->addAttribute('class', 'ge-export-svg-dark');

        $defs = $svgAsXML->defs;

        $style = $defs->addChild('style');
        $style->addAttribute('type', 'text/css');
        $style[0] = 'svg.ge-export-svg-dark { filter: invert(100%) hue-rotate(180deg); }&#xa;svg.ge-export-svg-dark foreignObject img,&#xa;svg.ge-export-svg-dark image:not(svg.ge-export-svg-dark switch image),&#xa;svg.ge-export-svg-dark svg { filter: invert(100%) hue-rotate(180deg) }';

        $output = $svgAsXML->saveXML();
        return $output;
    }
}
