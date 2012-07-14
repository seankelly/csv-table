<?php
/**
 * @package sports-reference
 * @version 1.2
 */
/*
Plugin Name: sports-reference
Plugin URI:
Description: Displays CSV data from a Sports Reference site in a vaguely Sports Reference style.
Author: Sean Kelly
Version: 1.2
Author URI:
*/

class srTable {
    const VERSION = 1.2;

    public function init() {
        // Add the shortcode for posts.
        add_shortcode('sr', array('srTable', 'sr_shortcode_cb'));
        // This is for comment text. The shortcode is safe for including in
        // comments, plus I think most people would want to use it there.
        add_filter('comment_text', array('srTable', 'shortcode_in_comment'));
        add_action('wp_enqueue_scripts', array('srTable', 'enqueue_scripts'));
    }

    public function enqueue_scripts() {
        wp_enqueue_style('sports-reference', plugins_url( 'sr-table.css', __FILE__));
        wp_enqueue_script('sports-reference',
                          plugins_url('sr-table-sort.js', __FILE__),
                          array('jquery'),
                          srTable::VERSION
            );
    }

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

        $thead = FALSE;
        $final_html = array();

        // Content is not null. Assume it's CSV data and try to make sense of it.
        $rows = str_getcsv($content, "\n");
        foreach ($rows as &$row) {
            $len = strlen($row);
            if ($len === 0) {
                continue;
            }

            $fields = str_getcsv($row);

            // Count the number of a-z character to try guess if it's a header.
            $count = preg_match_all('/[a-z]/i', $row, $matches);
            $is_header = (($count / $len) > 0.5);

            array_push($final_html, srTable::make_row($is_header, $fields, $thead));
        }

        return ('<table class="sports-reference">'
               . implode("", $final_html)
               . '</table>');
    }

    private function make_row($is_header, $columns, &$thead) {
        $row_classes = array();
        if ($is_header) {
            $tag = 'th';
            if ($thead === TRUE) {
                $row_classes[] = 'thead';
            }
        }
        else {
            $tag = 'td';
        }

        $len = 0;
        foreach ($columns as &$col) {
            $len += strlen($col);
            $col = srTable::wrap_column($col, $tag);
        }

        // If there is no data in the row, mark it as blank to
        // de-emphasize the row.
        if ($len == 0) {
            $row_classes[] = 'blank_row';
        }

        $row_class = '';
        if (count($row_classes) > 0) {
            $row_class = ' class="' . implode(' ', $row_classes) . '"';
        }

        $html = '<tr' . $row_class . '>' . implode('', $columns) . '</tr>';

        // Mark the first row as part of the thead section. This makes
        // sorting much easier, as it can handle just the body rows.
        if ($thead === FALSE) {
            $thead = TRUE;
            $html = '<thead>' . $html . '</thead>';
        }

        return $html;
    }

    private function wrap_column($column, $tag) {
        $align = '';
        $count = preg_match_all('/[a-z]/i', $column, $matches);
        $len = strlen($column);
        if (($len > 0) && (($count / $len) >= 0.5)) {
            $align = ' align="left"';
        }
        else {
            $align = ' align="right"';
        }

        if ($tag === 'th') {
            $align = ' align="center"';
        }

        return ('<' . $tag . $align . '>'
                . htmlspecialchars($column)
                . '</' . $tag . '>');
    }
}

srTable::init();
