(function ($) {
    function initialize() {
        var process_table = function() {
            var $table = $(this);
            var column = 1;

            var process_header = function() {
                var $th = $(this);
                $th.data('nth', column);
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
        console.log($th);
    }

    $(document).ready(initialize);
}(jQuery))
