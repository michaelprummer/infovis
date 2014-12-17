/**
 * Created by mp on 15.12.2014.
 */

Parser = function($param){
    var CONTENTMODE_JSON = 1;
    var CONTENTMODE_HTML = 2;
    var url = "ajax.php";
    var isDone = false;
    var localData = {authors: {}, papers:{}, media:{}};
    var ajaxloader = $("<div id='ajaxloader'></div>");

    Parser.prototype.getAuthor = function(name,paper){}
    Parser.prototype.getAuthors= function (paper){}
    Parser.prototype.getPapers= function (name,conference){}
    Parser.prototype.getConference= function (paper){}
    Parser.prototype.getConferences= function (name){}
    Parser.prototype.filter= function (json,key){}
    Parser.prototype.callApi= function (options){
        console.log("call api with: ");
        console.log(options);

        //options = {name: ,year: ,group: ,project: ,medium: }
        //url = "ajax.php?"+(options['name'] != null ? options['name'] : 'all')+":"+(options['year'] != null ? options['year'] : 'all')+":"+(options['group'] != null ? options['group'] : 'all')+":"+(options['project'] != null ? options['project'] : 'all')+      ":"+(options['medium'] != null ? options['medium'] : 'all');
        url = "ajax.php";
        var me = this;

        $.ajax({
            url: url,
            type: "post",
            data: {
                'param0' : options['name'],
                'param1' : options['year'],
                'param2' : options['group'],
                'param3' : options['project'],
                'param4' : options['medium'],
                'contentMode' : CONTENTMODE_JSON
            },
            dataType:'json',
            beforeSend: function(){

              $("#canvas").innerHTML ="";
              $("#canvas").append(ajaxloader);
            },
            success: function(data,status,xhr){

                    $('#canvas').append(data.toString());
                    console.log(data);

                    $('#ajaxloader').animate({
                    opacity: 0
                    }, 1000, "linear", function() {
                    $('#ajaxloader').remove()
                    });
                me.updateLocalData(data);

                }
        })
    }
    Parser.prototype.updateLocalData = function (data){
        // cache api call result
        // data parameter can look like localdata {authors: {}, papers:{}, media:{}}
        // check for every entry if it already exists in localdata and updates it otherwise create entries.
    }


}

