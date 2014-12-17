/**
 * Created by mp on 15.12.2014.
 */

Parser = function(opts){
    var CONTENTMODE_JSON = 1;
    var CONTENTMODE_HTML = 2;
    var url = "ajax.php";
    var canvasId="canvas";
    var canvas = d3.select(canvasId);
    var isDone = false;
    this.svg =opts["svg"];
    //var localData = {authors: {}, papers:{}, media:{}};

    var ajaxLoader = $("<div id='ajaxloader'></div>");
    var that = this;
    // methods if we had a nice structured database
    /*Parser.prototype.getAuthor = function(name,paper){}
    Parser.prototype.getAuthors= function (paper){}
    Parser.prototype.getPapers= function (name,conference){}
    Parser.prototype.getConference= function (paper){}
    Parser.prototype.getConferences= function (name){}
    Parser.prototype.filter= function (json,key){}*/

    Parser.prototype.callApi= function (options){
        console.log("call api with: ");
        console.log(options);
        this.options = options;
        var ret = [];

        url = "ajax.php";

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
                $("#canvas").addClass("loading");
                $("#canvas").innerHTML ="";
            },
            success: function(data,status,xhr) {
                ret = data;
                $("#" + canvasId).removeClass("loading");
                that.updateLocalData(data);

                console.log(data);

                var bubble;
                if (that.options['name'] != null) {
                    var author = that.options['name'];
                    var re = new RegExp(".*" + author.toLowerCase() + "$");
                    var realAuthorname = "";
                    if (data.length > 0) {
                        for (var i = 0; i < data[0].elements[0].authors.length; i++) {
                            if (re.test(data[0].elements[0].authors[i].toLowerCase())) {
                                realAuthorname = data[0].elements[0].authors[i];
                                console.log(author + " matches " + realAuthorname);
                                var options = {papers: data, author: realAuthorname, svg: that.svg};
                                bubble = new AuthorBubble(options);


                            }

                        }
                    }
                }
            }
        })
    }
    Parser.prototype.updateLocalData = function (data){


        // cache api call result
        // data parameter can look like localdata {authors: {}, papers:{}, media:{}}
        // check for every entry if it already exists in localdata and updates it otherwise create entries.
    }


}

