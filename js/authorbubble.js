/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = function(options){
    var that = this;

    //options
    this.papers = options.hasOwnProperty("papers") ? options["papers"] : null;
    this.svg = options['svg'];
    this.root = options['root'];
    this.id= options["id"];
    this.authorname = options.hasOwnProperty("author") ? options["author"] : "Max Mustermann";
    this.x = options.hasOwnProperty("x") ? options.x : 0;
    this.y = options.hasOwnProperty("y") ? options.y : 0;
    this.width = options.hasOwnProperty("width") ? options.width : 300;
    this.height = options.hasOwnProperty("height") ? options.height : 300;

    //ui variables
    this.detailView = this.root ? true :false;


    // data
    this.data={author: this.authorname, papers:{}};
    this.yearLabels = [];
    this.yearPaperCount = [];
    this.paperTitles = [];



    AuthorBubble.prototype.showDetails = function(){
        this.detailView = !this.detailView;
        if(this.detailView == false){
            this.paperFan.transition().style("opacity",0);
            this.activityPie.transition().style("opacity",0);
        }else{
            this.paperFan.transition().style("opacity",1);
            this.activityPie.transition().style("opacity",1);
        }
    }
    AuthorBubble.prototype.listPapers = function(){
        ret = [];
        for (var i = 0; i < this.papers.length; i++) {
            for (var j = 0; j < this.papers[i].elements.length; j++) {
                ret.push(this.papers[i].elements[j].title);
            }
        }
        return ret;
    }

    AuthorBubble.prototype.createD3Data = function(){
        for (var i = 0; i < this.papers.length; i++) {
            this.yearLabels.push(this.papers[i].year);

            this.yearPaperCount.push(this.papers[i].elements.length);
        }
        this.paperTitles = this.listPapers();

    }

    var monochrome = d3.scale.ordinal().range(["#01EC6A","#1DF47D","#60FDA6","#91FDC1","#CEFEE3","#F7FEFA"]);
    var w = 300;
    var h = 300;
    var outerRadius = w / 2;
    var innerRadius = 100;
    var color= monochrome;


    //console.log(this.yearPaperCount);
    this.bubble = this.svg.append("g").attr("transform", "translate(" + this.x + "," + this.y + ")").attr("id","bubble"+this.id).attr("class","authorBubble");

    // AUTHOR NAME =>CLICKABLE?
    var namebadge = this.bubble
        .append("g")
        .attr("class","name");
        if(this.root){
            namebadge.on("mousedown",function(){
                that.showDetails();
            });
        }else{
            //make root and new call
        }


    namebadge.append("circle")
        .style("fill", "green")
        .attr("cx",this.width/2 - innerRadius)
        .attr("cy",this.height/2 - innerRadius)
        .attr("r",this.width/2)
        .attr("text-anchor", "middle")


    namebadge.append("text")
        .text(this.authorname)
        .attr("text-anchor", "middle")
        .attr("dx",this.width/2 - innerRadius)
        .attr("dy",this.height/2 - innerRadius)
        .attr("class","authorname")
        .style("fill","#ffffff");
    if(!this.root){
        namebadge.attr("transform","scale(0.5)")
    }

    if(this.papers){
        this.createD3Data();

    // console.log("creating author bubble with name: "+this.authorname);


        // ACTIVITY PIE
        this.activityPie =  this.bubble.append("g").attr("class","activityPie");

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            var pie = d3.layout.pie().value(function(d){return d;});


            //Set up groups
            var arcs = this.activityPie.selectAll("g.activityArc")
                .data(
                    pie(that.yearPaperCount)
                )
                .enter()
                .append("g")
                .attr("class", "activityArc")
                .attr("transform", "translate(" + (this.width/2 - innerRadius) + "," + (this.width/2 - innerRadius) + ")");

            //Draw arc paths
            arcs.append("path")
                .attr("d", arc)
                .attr("id",function(d,i){
                    return "author"+that.id+"_section"+i;
                })
                .attr("fill"    , function(d, i) {
                return color(i);
            });

            //year Labels
            arcs.append("text")
                .attr("transform", function(d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d,i) {
                    return that.yearLabels[i];
                });




        function paper(d,i){
            return d[i];
        }

        this.paperFan = this.bubble.append("g").attr("class","paperFan");

        this. paperFan.selectAll("text")
            .data(that.paperTitles)
            .enter().append("g")
            .attr("title", function(d,i){
                return that.paperTitles[i].toString();
            })
            .attr("transform", function(d, i) {
                var angle = (360/that.paperTitles.length)*i-85;
                this.currentAngle = angle;
                var r = 240;
                var cx = (that.width/2 - 100);
                var cy = (that.height/2 - 100);
                var x = cx + r *Math.cos(angle*0.0174532925);
                var y = cy + r *Math.sin(angle*0.0174532925);
                return "translate(" + x + ", "  + y +") rotate(" + angle + ")";
            })
            .each(function(d, i){
                d3.select(this)
                    .append('g')
                    .attr("index", i)
                    .attr("transform", function(d) {
                        var angle = (360/that.paperTitles.length)*i;
                        return "rotate(" + ((angle > 130 && angle < 355) ? 180 : 0) + ")"

                    }).append('text').text(function(d, i){
                        var index = $(d3.select(this).node().parentNode).attr("index");
                        var angle = (360/that.paperTitles.length)*index;
                        var text = d
                        var len = 20;
                        if(text.length < len) {
                            var oldLen = text.length;

                            for(i=0;i<(len - oldLen + 3);i++){
                                text = (angle > 130 && angle < 355)? (text+"."):("."+text);
                            }

                        } else {
                            text = text.substr(0,len)
                            text = (angle > 130 && angle < 355)? (text+"..."):("..."+text);
                        }

                        return text;
                    })


            })
            .style("font-size","11.5pt")
            .attr("text-anchor", "middle")
            .attr("class","paper")
            .style("fill","#000");

        if(!this.detailView){
            this.paperFan.attr("opacity",0);
            this.activityPie.attr("opacity",0);
        }
    }



    return this;
/*

 */

}
