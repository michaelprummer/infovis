/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = function(options){
    var that = this;
    // Canvas size
    this.canvasWidth = $("#svg-container").attr("width");
    this.canvasHeight = $("#svg-container").attr("height");

    // Options
    this.papers = options.hasOwnProperty("papers") ? options["papers"] : null;
    this.svg = options['svg'];
    this.root = options['root'];
    this.id= options["id"];
    this.authorname = options.hasOwnProperty("author") ? options["author"] : "Max Mustermann";
    this.x = options.hasOwnProperty("x") ? options.x : 0;
    this.y = options.hasOwnProperty("y") ? options.y : 0;

    // UI variables
    this.detailView = this.root ? true :false;

    // Data
    this.data={author: this.authorname, papers:{}};
    this.yearLabels = [];
    this.yearPaperCount = [];
    this.paperTitles = [];
    this.papers_count = 0;

    this.innerRadius;
    this.outerRadius;

    Number.prototype.clamp = function(min, max) {
        return Math.min(Math.max(this, min), max);
    };

    AuthorBubble.prototype.countPapers = function(){
        if(this.papers){
            var count = 0;
            for(var i=0;i<this.papers.length;i++){
                count += this.papers[i]["elements"].length;
            }
            return count;

        }else{
            return 0;
        }
    }

    AuthorBubble.prototype.getPaperPosition = function(id){

        var angle = (360/this.countPapers())*id-85;
        var r = that.outerRadius + 270;
        var cx = (that.canvasWidth/2);
        var cy = (that.canvasHeight/2);
        var x = cx + r *Math.cos(angle*0.0174532925);
        var y = cy + r *Math.sin(angle*0.0174532925);

        return [x, y];


    }

    // Count papers
    if(this.papers && this.root){
        for(var i=0;i<this.papers.length;i++){
            this.papers_count += this.papers[i]["elements"].length;
        }

        this.innerRadius = (this.papers_count*3.5).clamp(50,200);
        this.outerRadius =  this.innerRadius +50;

    } else {
        this.innerRadius = 30;
        this.outerRadius =  this.innerRadius+10;
    }

    AuthorBubble.prototype.showDetails = function(){
        this.detailView = !this.detailView;
        if(this.detailView == false){
            this.paperFan.transition().style("opacity",0);
            this.activityPie.transition().style("opacity",0);
            d3.selectAll(".coauthor > path")
                .attr("data-alpha",function(d,i){
                    d3.select(this).style("opacity");
                })
                .transition()
                .style("opacity",0);
        }else{
            this.paperFan.transition().style("opacity",1);
            this.activityPie.transition().style("opacity",1);
            d3.selectAll(".coauthor path")
                .transition()
                .style("opacity",function(d,i){
                    return d3.select(this).attr("data-alpha")
                });
        }
    }
    AuthorBubble.prototype.listPapers = function(){
        ret = [];
        for (var i = 0; i < this.papers.length; i++) {
            for (var j = 0; j < this.papers[i].elements.length; j++) {
                ret.push({title: this.papers[i].elements[j].title, id: this.papers[i].elements[j].paper_index,year:this.papers[i].year});
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
    var color= monochrome;


    //console.log(this.yearPaperCount);

    this.bubble = this.svg.append("g").attr("transform", "translate(" + this.x + "," + this.y + ")").attr("id","bubble"+this.id).attr("class","authorBubble");

    // AUTHOR NAME =>CLICKABLE?
    var namebadge = this.bubble
        .append("g")
        .attr("class","name")
        .attr("id",this.authorname);
        if(this.root){
            namebadge.on("click",function(){
                //that.showDetails();
            });
        } else {
            namebadge.on("mouseover",function(ev){
                    d3.select(this.parentNode.parentNode).selectAll("path")
                        .each(function(d,i){
                            var path =  d3.select(this);
                            if(parseFloat(path.style("opacity")) > 0){
                                path.transition().style("opacity",1)
                            }
                            d3.selectAll(".paper g[index='"+d3.select(this).attr("paperid")+"']").style("font-weight","bold");
                        });
                d3.select(this).transition().style("opacity",1);
            })
            namebadge.on("mouseout",function(ev){
                    d3.select(this.parentNode.parentNode).selectAll("path")
                        .each(function(d,i){
                            var path =  d3.select(this);
                            if(parseFloat(path.style("opacity")) > 0){
                                path.transition().style("opacity",.2)
                            }
                            d3.selectAll(".paper g[index='"+d3.select(this).attr("paperid")+"']").style("font-weight","normal")
                        })
                d3.select(this).transition().style("opacity",.2)
            })
        }

    var cxBubble = (this.root)? (this.canvasWidth/2) : (this.canvasWidth/4)
    var cyBubble = (this.root)? (this.canvasHeight/2) : (this.canvasHeight/4)

    namebadge.append("circle")
        .style("fill", "green")
        .attr("cx", cxBubble)
        .attr("cy", cyBubble)
        .attr("r",options.hasOwnProperty("r") ? options["r"] : this.innerRadius)
        .attr("text-anchor", "middle")


    var full_name = this.authorname.split(" ");
    var name_font_size = (this.root)?(12):(8); // pt

    for(var i=0;i<full_name.length;i++){
        namebadge.append("text")
            .text(full_name[i])
            .attr("text-anchor", "middle")
            .attr("dx", cxBubble)
            .attr("dy", cyBubble-(name_font_size/2*full_name.length) + 25*i)
            .attr("class","authorname")
            .style("fill","#b2f1ff")
            .style("font-size", (name_font_size + "pt"));
    }


    if(this.papers){
        this.createD3Data();

        // ACTIVITY PIE
        this.activityPie =  this.bubble.append("g").attr("class","activityPie");
        var arc = d3.svg.arc()
           .innerRadius(this.innerRadius)
           .outerRadius(this.outerRadius);

        var pie = d3.layout.pie().value(function(d){return d;}).sort(null);

        //Set up groups
            var arcs = this.activityPie.selectAll("g.activityArc")
                .data(pie(that.yearPaperCount)).enter().append("g")
                .attr("class", "activityArc")
                .attr("transform", "translate(" + (this.canvasWidth/2) + "," + (this.canvasHeight/2) + ")");

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
                //return (d.title.toString()+" "+ d.year.toString());
                return (d.title.toString()+" "+ d.year.toString());
            })
            .attr("transform", function(d, i) {
                var angle = (360/that.paperTitles.length)*i-85;
                this.currentAngle = angle;
                var r = that.outerRadius + 80;
                var cx = (that.canvasWidth/2);
                var cy = (that.canvasHeight/2);
                var x = cx + r *Math.cos(angle*0.0174532925);
                var y = cy + r *Math.sin(angle*0.0174532925);

                return "translate(" + x + ", "  + y +") rotate(" + angle + ")";
            })
            .attr("paper_id", function(d) {return d.id})

            .each(function(d, i){
                d3.select(this)
                    .append('g')
                    .attr("index", i)
                    .attr("transform", function(d) {
                        var angle = (360/that.paperTitles.length)*i;
                            return "rotate(" + ((angle > 180 && angle < 355) ? 180 : 0) + ")"

                    }).append('text').text(function(d, i){
                        var index = $(d3.select(this).node().parentNode).attr("index");
                        var angle = (360/that.paperTitles.length)*index;
                        var text = d.title
                        var len = 20;

                        if(text.length < len) {
                            var oldLen = text.length;
                            for(i=0;i<(len - oldLen + 3);i++){
                                text = (angle > 130 && angle < 355)? (text+"."):(text+".");
                            }
                        } else {
                            text = text.substr(0,len)
                            text += "...";
                        }

                        return text;
                    })
            })
            .style("font-size","11.5pt")
            .attr("class","paper")
            .attr("text-anchor","middle")
            .style("fill","#000");

        if(!this.detailView){
            this.paperFan.attr("opacity",0);
            this.activityPie.attr("opacity",0);
        }

    }
    return this;
}
