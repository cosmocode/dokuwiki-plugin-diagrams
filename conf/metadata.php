<?php
/*
 * Diagrams plugin, configuration metadata
 */
$meta['service_url']  = array('string');
$meta['theme'] = array('multichoice', '_choices' => array('light', 'dark'));
$meta['mode'] = array('multichoice', '_choices' => array(1, 2, 3));
$meta['pngcache'] = array('onoff');
