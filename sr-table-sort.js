(function ($) {
    function initialize() {
        var id = 1;

        var process_table = function() {
            var $table = $(this);
            var column = 1;

            // Since I'm creating the HTML for this, I know there's no
            // id assigned already, so assign one now for easier
            // manipulation later.
            var table_id = 'sports-reference-' + id;
            $table.attr('id', table_id);

            var process_header = function() {
                var $th = $(this);
                $th.data('info', {'nth': column, 'table_id': table_id});
                $th.data('sort', {'order': undefined});
                $th.on('click', sort_column);
                $th.toggleClass('sortable');
                column++;
            }

            var row_id = 0;
            var process_row = function() {
                var $tr = $(this);
                $tr.data('info', {'row_id': row_id, 'table_id': table_id});
                row_id++;
            }

            $table.find('th').each(process_header);
            $table.find('tr').each(process_header);
            id++;
        }

        $('table.sports-reference').each(process_table);
    }

    function sort_column(ev) {
        var $th = $(ev.target);
        var info = $th.data('info');
        var sort = $th.data('sort');
        var next_sort = {'order': undefined};
        var handle_class = function () {};

        if (sort.order === undefined) {
            next_sort.order = 'desc';
            handle_class = function (th) {
                th.addClass('sorted');
            }
        } else if (sort.order === 'desc') {
            next_sort.order = 'asc';
            // Still sorted, don't do anything with the 'sorted' class.
        } else {
            next_sort.order = undefined;
            handle_class = function (th) {
                th.removeClass('sorted');
            }
        }

        handle_class($th);
        var $table = $th.parents('table.sports-reference');
        var selector = 'tr td:nth-child(' + info.nth + ')';
        $table.find(selector).each(function() {
            handle_class($(this));
        });

        if (next_sort.order !== undefined) {
            sort_table(info.table_id, info.nth, sort.order);
        }
        else {
            reset_table(info.table_id);
        }

        $th.data('sort', next_sort);
    }

    function get_el(text) {
        var check_for_wl = /^(\d+)-(\d+)$/;
        var wl = check_for_wl.match(text);
        if (!wl) {
            return text;
        }
        else {
            return parseInt(wl[1]) - parseInt(wl[2]);
        }
    }

    function sort_table(table_id, column, sort_order) {
    }

    function reset_table(table_id) {
    }

    $(document).ready(initialize);
}(jQuery))
