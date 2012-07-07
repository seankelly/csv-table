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

class srTable {
    public function shortcode_in_comment($content) {
        global $shortcode_tags;

        if (empty($shortcode_tags) || !is_array($shortcode_tags)) {
            return $content;
        }

        $_shortcode_tags = $shortcode_tags;
        $shortcode_tags = array();

        add_shortcode('sr', array('srTable', 'sr_shortcode_cb'));
        $new_content = do_shortcode($content);

        $shortcode_tags = $_shortcode_tags;

        return $new_content;
    }

    public function sr_shortcode_cb($attrs, $content=null) {
        if (is_null($content)) {
            return '';
        }

        $final_html = array();

        // Content is not null. Assume it's CSV data and try to make sense of it.
        $rows = str_getcsv($content, "\n");
        foreach ($rows as &$row) {
            $len = strlen($row);
            if ($len == 0) {
                continue;
            }

            $fields = str_getcsv($row);

            // Count the number of a-z character to try guess if it's a header.
            $count = preg_match_all('/[a-z]/i', $row, $matches);
            if (($count / $len) > 0.5) {
                $is_header = TRUE;
                $opening_tag = '<td>';
                $closing_tag = '</td>';
            }
            else {
                $is_header = FALSE;
                $opening_tag = '<th>';
                $closing_tag = '</th>';
            }

            array_push($final_html, srTable::make_row($is_header, $fields));
        }

        return '<!--' . implode("\n", $final_html) . '-->';
    }

    public function make_row($is_header, $columns) {
        if ($is_header) {
            $opening_tag = '<th>';
            $closing_tag = '</th>';
        }
        else {
            $opening_tag = '<td>';
            $closing_tag = '</td>';
        }

        return ($opening_tag
                . implode($closing_tag . $opening_tag, $columns)
                . $closing_tag);
    }
}

add_filter('comment_text', array('srTable', 'shortcode_in_comment'));
