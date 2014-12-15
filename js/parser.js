/**
 * Created by mp on 15.12.2014.
 */


Parser = function(){
    var url = "http://www.medien.ifi.lmu.de/cgi-bin/search.pl?all:all:all:mobile:all";

    $.ajax({
            url: url,
            crossDomain: true
    }).done(function (){
        alert(data)
    })

}

