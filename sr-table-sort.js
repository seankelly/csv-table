(function ($) {
    function initialize() {
        var process_table = function() {
            var $table = $(this);
            var column = 1;

            var process_header = function() {
                var $th = $(this);
                $th.data('nth', column);
                $th.data('sort', undefined);
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
        $th.toggleClass('sorted');
        var $table = $th.parents('table.sports-reference');
        var selector = 'tr td:nth-child(' + column + ')';
        $table.find(selector).each(function() {
            $(this).toggleClass('sorted');
        });
    }

    $(document).ready(initialize);
}(jQuery))
