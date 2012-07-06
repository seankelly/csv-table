<?php
/**
 * @package sports-reference
 * @version 0.1
 */
/*
Plugin Name: sports-reference
Plugin URI:
Description: Displays CSV data from a Sports Reference site in a vaguely Sports Reference style.
Author: Sean Kelly
Version: 0.1
Author URI:
*/

function sr_shortcode_cb($attrs, $content=null) {
    if (is_null($content)) {
        return '';
    }

    // Content is not null. Assume it's CSV data and try to make sense of it.
}

add_shortcode('sr', 'sr_shortcode_cb');
