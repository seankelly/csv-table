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
            $table.find('tr').each(process_row);
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
        var $table = $('#' + info.table_id);
        var selector = 'tr td:nth-child(' + info.nth + ')';
        $table.find(selector).each(function() {
            handle_class($(this));
        });

        sort_table(info.table_id, info.nth, next_sort.order);

        $th.data('sort', next_sort);
    }

    function get_el(text) {
        var check_for_wl = /^(\d+)-(\d+)$/;
        var wl = text.match(check_for_wl);
        if (!wl) {
            return text;
        }
        else {
            return parseInt(wl[1]) - parseInt(wl[2]);
        }
    }

    function cmp(order) {
        // The two functions are using the is_text variable because
        // I want strings and numbers to sort differently. Number, for
        // 'asc', I actually want to be 'desc' in order to mimic how
        // sports-reference does it.
        var fn = {
            'asc': function(is_text, a, b) {
                if (!is_text) {
                    return a - b;
                }
                return b > a;
            },
            'desc': function(is_text, a, b) {
                if (!is_text) {
                    return b - a;
                }
                return a > b;
            }
        };
        var f = fn[order];
        var g = function(a, b) {
            var a_text = get_el(a.text);
            var b_text = get_el(b.text);

            var is_text = isNaN(parseFloat(a_text));
            return f(is_text, a_text, b_text);
        }
        return g;
    }

    function sort_table(table_id, column, sort_order) {
        var table = document.getElementById(table_id);
        var body = table.tBodies[0];
        var ordered = [];
        for (var i = 0; i < body.rows.length; i++) {
            var row = body.rows[i];
            var text = row.cells[column-1].textContent;
            var $r = $(row);
            var info = $r.data('info');
            ordered.push({'i': info.row_id, 'text': text, 'row': row});
        }

        if (sort_order !== undefined) {
            ordered.sort(cmp(sort_order));
        }
        else {
            ordered.sort(function(a, b) {
                return a.i > b.i;
            });
        }

        for (i = 0; i < ordered.length; i++) {
            body.appendChild(ordered[i].row);
        }
    }

    $(document).ready(initialize);
}(jQuery))
