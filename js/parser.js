/**
 * Created by mp on 15.12.2014.
 */


Parser = function($param){
    var url = "ajax.php";
    var isDone = false;


    $(document).ready(function() {
        $("body").prepend("<div id='ajaxloader'></div>")

        $.ajax({
            url: url,
            type: 'post',
            data: {
                "param0": $param[0],
                "param1": $param[1],
                "param2": $param[2],
                "param3": $param[3],
                "param4": $param[4]
            }
        }).done(function (data){
            $('body').append(data);

            $('#ajaxloader').animate({
                opacity: 0
            }, 1000, "linear", function() {
                $('#ajax-loader').remove()
            });
        })
    });

}

