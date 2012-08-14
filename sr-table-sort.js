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
            // Associate the sorting with the table. That way, it's possible to
            // keep track if the sorting column has changed or not.
            $table.data('sort', {'order': undefined, 'column': -1});

            var process_header = function() {
                var $th = $(this);
                $th.data('info', {'nth': column, 'table_id': table_id});
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

            $table.find('thead th').each(process_header);
            $table.find('tr').each(process_row);
            id++;
        }

        $('table.sports-reference').each(process_table);
    }

    function sort_column(ev) {
        var $th = $(ev.target);
        var info = $th.data('info');
        var $table = $('#' + info.table_id);
        var sort = $table.data('sort');
        var next_sort = {'order': undefined, 'column': -1};
        // column is the column to highlight as sorted.
        var column = info.nth - 1;

        if (sort.order === undefined || sort.column != column) {
            next_sort.order = 'desc';
        } else if (sort.order === 'desc') {
            next_sort.order = 'asc';
        } else {
            next_sort.order = undefined;
            // When removing all highlighting, set column to -1 to
            // ensure it will never match against any cell index.
            column = -1;
        }

        highlight_column(info.table_id, column);
        sort_table(info.table_id, info.nth, next_sort.order);
        rerank_rows(info.table_id);

        next_sort.column = column;
        $table.data('sort', next_sort);
    }

    function highlight_column(table_id, column) {
        var re = / *sorted/;
        var f = function(tbl) {
            if (tbl === null || tbl === undefined) {
                return;
            }
            var rows = tbl.rows;
            for (var r = 0; r < rows.length; r++) {
                for (var c = 0; c < rows[r].cells.length; c++) {
                    var cell = rows[r].cells[c];
                    var classes = cell.className;
                    if (c !== column) {
                        // Remove the class 'sorted'.
                        classes = classes.replace(re, '');
                    }
                    else {
                        // Add the class 'sorted', if it isn't already
                        // preset.
                        if (classes.indexOf('sorted') === -1) {
                            classes += ' sorted';
                        }
                    }
                    cell.className = classes;
                }
            }
        }
        var parts = ['tHead', 'tBodies', 'tFoot'];
        var table = document.getElementById(table_id);
        for (var i in parts) {
            var prop = parts[i];
            if (prop !== 'tBodies') {
                f(table[prop]);
            }
            else {
                for (var r = 0; r < table[prop].length; r++) {
                    f(table[prop][r]);
                }
            }
        }
    }

    // Only re-rank the rows if the first cell in the first tHead row
    // contains the text 'Rk'.
    function rerank_rows(table_id) {
        var table = document.getElementById(table_id);
        if (!table.tHead || table.tHead.rows[0].cells[0].textContent !== 'Rk') {
            return;
        }
        var rank = 1;
        for (var b = 0; b < table.tBodies.length; b++) {
            var body = table.tBodies[b];
            for (var r = 0; r < body.rows.length; r++) {
                var cell = body.rows[r].cells[0];
                if (cell.textContent.length > 0 && cell.textContent !== 'Rk') {
                    cell.textContent = rank;
                    rank++;
                }
            }
        }
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
        // Sort function for floats/numbers.
        var fn_f = {
            'asc': function(a, b) {
                return a - b;
            },
            'desc': function(a, b) {
                return b - a;
            }
        };

        // Sort function for text.
        var fn_t = {
            'asc': function(a, b) {
                return b > a;
            },
            'desc': function(a, b) {
                return a > b;
            }
        };
        // For the lookup table:
        // n: NaN
        // t: text
        // f: float
        //
        //  B \ A  | empty | text | float
        //  -------+-------+------+-------
        //   empty |   0   |  1   |   1
        //  -------+-------+------+-------
        //    text |  -1   |  f   |   1
        //  -------+-------+------+-------
        //   float |  -1   | -1   |   f
        //  -------+-------+------+-------
        var lookup = {
            'nn': function() { return 0; },
            'nt': function() { return 1; },
            'nf': function() { return 1; },
            'tn': function() { return -1; },
            'tt': function(order, a, b) { return (fn_t[order])(a, b); },
            'tf': function() { return 1; },
            'fn': function() { return -1; },
            'ft': function() { return -1; },
            'ff': function(order, a, b) { return (fn_f[order])(a, b); },
        };
        var re = /[a-z]/i;
        var get_type = function(v) {
            if (v === '') {
                return 'n';
            }
            else if (re.test(v)) {
                return 't';
            }
            return 'f';
        }
        var g = function(a, b) {
            var A = get_el(a.text);
            var B = get_el(b.text);

            var key = get_type(A) + get_type(B);
            return (lookup[key])(order, A, B);
        }
        return g;
    }

    function sort_table(table_id, column, sort_order) {
        var table = document.getElementById(table_id);
        var body = table.tBodies[0];
        var ordered = [];
        for (var i = 0; i < body.rows.length; i++) {
            var row = body.rows[i];
            if (sort_order !== undefined) {
                // If sorting, hide any rows with the 'thead' class.
                if (row.className.indexOf('thead') !== -1) {
                    row.style.display = 'none';
                }
            }
            else {
                // When resetting, display thead rows.
                if (row.className.indexOf('thead') !== -1) {
                    row.style.display = '';
                }
            }
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
