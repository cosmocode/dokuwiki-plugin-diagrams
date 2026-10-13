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
        $svg = file_get_contents($file, false, null, 0, (int)$this->getConf('detectbytes'));
        return $this->isDiagram($svg);
    }

    /**
     * Check if the given SVG is a diagrams.net diagram
     *
     * This is done by ensuring that the service host is part of the SVG header or that the
     * SVG root element carries the diagram model in its content attribute, which is what
     * diagrams.net needs to edit the file. The latter covers exports from app.diagrams.net
     * or the VS Code extension, which do not mention any of the known hosts.
     *
     * @param string $svg The raw SVG data (only the configured leading bytes are checked)
     * @return bool
     */
    public function isDiagram($svg)
    {
        $svg = substr($svg, 0, (int)$this->getConf('detectbytes')); // makes checking a tiny bit faster
        $svg = preg_replace('/<\?xml.*?>/', '', $svg);
        $svg = preg_replace('/<!--.*?-->/', '', $svg);
        $svg = preg_replace('/<!DOCTYPE.*?>/', '', $svg);
        $svg = ltrim($svg);

        if (empty($svg) || substr($svg, 0, 4) !== '<svg') return false;
        $confServiceUrl = $this->getConf('service_url'); // like "https://diagrams.xyz.org/?embed=1&..."
        $serviceHost = parse_url($confServiceUrl, PHP_URL_HOST); // Host-Portion of the Url, e.g. "diagrams.xyz.org"
        return strpos($svg, 'embed.diagrams.net') || strpos($svg, 'draw.io') || strpos($svg, $serviceHost) ||
            preg_match('/^<svg\b[^>]*\scontent="&lt;mxfile[\s&]/', $svg);
    }
}
