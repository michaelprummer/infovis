/**
 * Created by mp on 15.12.2014.
 */


Parser = function($param){
    var url = "ajax.php";

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
    })

}

