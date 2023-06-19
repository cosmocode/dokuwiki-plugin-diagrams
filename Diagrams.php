<?php

namespace dokuwiki\plugin\diagrams;

/**
 * Currently only used to hold constants
 */
class Diagrams {
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
        'sandbox' => "allow-popups allow-top-navigation allow-same-origin",
    ];
}
