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
     * Check if the given SVG is a diagrams.net diagram
     *
     * This is done by ensuring that the service host is part of the SVG header
     *
     * @param string $svg The raw SVG data (first 500 bytes are enough)
     * @return bool
     */
    public function isDiagram($svg) {
        $svg = substr($svg, 0, 500); // makes checking a tiny bit faster
        $confServiceUrl = $this->getConf('service_url'); // like "https://diagrams.xyz.org/?embed=1&..."
        $serviceHost = parse_url($confServiceUrl, PHP_URL_HOST); // Host-Portion of the Url, e.g. "diagrams.xyz.org"
        return strpos($svg, 'embed.diagrams.net') || strpos($svg, 'draw.io') || strpos($svg, $serviceHost);
    }
}

