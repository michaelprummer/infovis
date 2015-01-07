/**
 * Created by mp on 15.12.2014.
 */

Parser = function(opts){
    var that = this;
    var CONTENTMODE_JSON = 1;
    var CONTENTMODE_HTML = 2;
    var url = "apiCallLMU.php";
    var canvasId="canvas";
    var canvas = d3.select(canvasId);
    var isDone = false;

    this.svg =opts["svg"];
    this.layouter = opts["layouter"];

    this.filter = {};
    //var localData = {authors: {}, papers:{}, media:{}};

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

        url = "apiCallLMU.php";

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
                $("#error").fadeOut(200);
            },
            success: function(data,status,xhr) {
                ret = data;
                $("#" + canvasId).removeClass("loading");
                $(that.svg[0]).empty();


                var bubble;
                if (that.options['name'] != null) {
                    var author = that.options['name'];
                    var re = new RegExp(".*" + author.toLowerCase() + "$");
                    var realAuthorname = "";
                    if (data.length > 0) {
                        data = that.filterData(data);
                        console.log("Api Call result:");
                        console.log(data);

                        for (var i = 0; i < data[0].elements[0].authors.length; i++) {
                            if (re.test(data[0].elements[0].authors[i].toLowerCase())) {
                                realAuthorname = data[0].elements[0].authors[i];
                                console.log(author + " matches " + realAuthorname);
                                var options = {papers: data, author: realAuthorname, svg: that.svg};
                                that.layouter.generateRootBubble(options);


                            }

                        }
                    }
                }
            }

    }).fail(function(jqXHR, textStatus, errorThrown){
            $("#canvas").removeClass("loading");
            $("#error").text(textStatus+":"+errorThrown);
            $("#error").fadeIn(200);
        })
    }
    Parser.prototype.setLayouter = function(layouter){
        this.layouter = layouter;
    }
    Parser.prototype.addFilter = function(opts){
        if(opts.hasOwnProperty('year')){
            this.filter['year'] = opts['year'];
            console.log("year filter changed to: "+this.filter['year'].from+", "+this.filter['year'].to);
        }

    }
    Parser.prototype.filterData = function (data){
        if(this.filter["year"] != null){
            for (var i = 0; i < data.length; i++) {
                if(parseInt(data[i].year) < parseInt(this.filter["year"].from) || parseInt(data[i].year) > parseInt(this.filter["year"].to)){
                    //console.log("filtered:"+ data[i].year);
                    data.splice(i,1);
                    i--;
                }
            }
        }
        return data;
    }


}

