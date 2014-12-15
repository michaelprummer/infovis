/**
 * Created by mp on 15.12.2014.
 */

$("body").prepend("<div id='ajaxloader'></div>");

Parser = function($param){
    var url = "ajax.php";
    var isDone = false;
    var localData = {authors: {}, papers:{}, media:{}};

    Parser.prototype.getAuthor = function(name,paper){}
    Parser.prototype.getAuthors= function (paper){}
    Parser.prototype.getPapers= function (name,conference){}
    Parser.prototype.getConference= function (paper){}
    Parser.prototype.getConferences= function (name){}
    Parser.prototype.filter= function (json,key){}
    Parser.prototype.callApi= function (options){

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
                'param4' : options['medium']
            },
            success: function(data,status,xhr){
                    $('body').append(data);

                    $('#ajaxloader').animate({
                    opacity: 0
                    }, 1000, "linear", function() {
                    $('#ajax-loader').remove()
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

