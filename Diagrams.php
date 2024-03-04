<?php

namespace dokuwiki\plugin\diagrams;

/**
 * Currently only used to hold constants
 */
class Diagrams
{
    const MODE_MEDIA = 1;
    const MODE_EMBED = 2;

    const CSP = [
        'default-src' => "'none'",
        'style-src' => "'unsafe-inline' fonts.googleapis.com",
        'media-src' => "'self'",
        'object-src' => "'self'",
        'font-src' => "'self' data: fonts.gstatic.com",
        'form-action' => "'none'",
        'frame-ancestors' => "'self'",
        'img-src' => "self data:",
        'sandbox' => "allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-same-origin",
    ];

    const CACHE_EXT = '.diagrams.png';

    /**
     * Adds style node to render svg in dark theme
     *
     * @param string $svg
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
