(function ($) {
    function initialize() {
        var process_table = function() {
            var $table = $(this);
            var column = 1;

            var process_header = function() {
                var $th = $(this);
                $th.data('nth', column);
                $th.data('sort', {'order': undefined});
                $th.on('click', sort_column);
                $th.toggleClass('sortable');
                column++;
            }

            $table.find('th').each(process_header);
        }

        $('table.sports-reference').each(process_table);
    }

    function sort_column(ev) {
        var $th = $(ev.target);
        var column = $th.data('nth');
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
        var selector = 'tr td:nth-child(' + column + ')';
        $table.find(selector).each(function() {
            handle_class($(this));
        });

        $th.data('sort', next_sort);
    }

    $(document).ready(initialize);
}(jQuery))
