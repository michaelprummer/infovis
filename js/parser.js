/**
 * Created by mp on 15.12.2014.
 */


Parser = function(){
    var url = "ajax.php";

    $.ajax({
            url: url,
            crossDomain: true
    }).done(function (data){
        $('body').append(data);
    })

}

