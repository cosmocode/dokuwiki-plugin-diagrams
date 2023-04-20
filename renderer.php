<?php
/**
 * DokuWiki Plugin diagrams (Renderer Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Innovakom + CosmoCode <dokuwiki@cosmocode.de>
 */
class renderer_plugin_diagrams extends Doku_Renderer
{

    /** @inheritDoc */
    public function getFormat()
    {
        return 'diagrams';
    }

    /**
     * Set proper headers
     */
    public function document_start()
    {
        global $ID;
        $headers = [
            'Content-Type' => 'image/svg+xml',
            'Content-Security-Policy' => $this->getCSP(),
        ];
        p_set_metadata($ID, ['format' => ['diagrams' => $headers]]);
        // don't cache
        $this->nocache();
    }

    /**
     * Create the content security policy
     * @return string
     */
    protected function getCSP() {
        $policy = [
            'default-src' => "'none'",
            'style-src' => "'unsafe-inline'",
            'media-src' => "'self'",
            'object-src' => "'self'",
            'font-src' => "'self' data:",
            'form-action' => "'none'",
            'frame-ancestors' => "'self'",
            'img-src' => "self data:",
            'sandbox' => "allow-popups allow-top-navigation allow-same-origin",
        ];

        /** @noinspection DuplicatedCode from dokuwiki\HTTP\Headers::contentSecurityPolicy() */
        foreach ($policy as $key => $values) {
            // if the value is not an array, we also accept newline terminated strings
            if (!is_array($values)) $values = explode("\n", $values);
            $values = array_map('trim', $values);
            $values = array_unique($values);
            $values = array_filter($values);
            $policy[$key] = $values;
        }

        $cspheader = '';
        foreach ($policy as $key => $values) {
            if ($values) {
                $cspheader .= " $key " . join(' ', $values) . ';';
            } else {
                $cspheader .= " $key;";
            }
        }

        return $cspheader;
    }
}

