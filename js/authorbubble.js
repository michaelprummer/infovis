/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = function(options){
    this.papers = options["papers"];
    this.id= options["id"];
    this.authorname = options["author"];
    this.svg = options['svg'];
    var that = this;
    this.data={author: this.authorname, papers:{}};
    this.yearLabels = [];
    this.yearPaperCount = [];
    this.paperTitles = [];
    this.detailView = false;

    AuthorBubble.prototype.showDetails = function(){

    }
    AuthorBubble.prototype.listPapers = function(){
        ret = [];
        for (var i = 0; i < this.papers.length; i++) {
            ret[i] = [];
            for (var j = 0; j < this.papers[i].elements.length; j++) {
                ret[i].push(this.papers[i].elements[j].title);
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
    //console.log(this.yearPaperCount);

    this.createD3Data();

    console.log("creating author bubble with name: "+this.authorname);
    this.bubble = this.svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")").attr("class","authorBubble");


    // ACTIVITY PIE
    var activityPie =  this.bubble.append("g").attr("class","activityPie");
    var monochrome = d3.scale.ordinal().range(["#01EC6A","#1DF47D","#60FDA6","#91FDC1","#CEFEE3","#F7FEFA"]);
        var w = 300;
        var h = 300;
        var outerRadius = w / 2;
        var innerRadius = 100;
        var color= monochrome;

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var pie = d3.layout.pie().value(function(d){return d;});


        //Set up groups
        var arcs = activityPie.selectAll("g.activityArc")
            .data(
                pie(that.yearPaperCount)
            )
            .enter()
            .append("g")
            .attr("class", "activityArc")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

        //Draw arc paths
        arcs.append("path")
            .attr("d", arc)
            .attr("id",function(d,i){
                return "author"+that.id+"_section"+i;
            })
            .attr("fill"    , function(d, i) {
            return color(i);
        });

        //Labels
        arcs.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d,i) {
                return that.yearLabels[i];
            });


    // AUTHOR NAME =>CLICKABLE?
        var namebadge = this.bubble
            .append("g")
            .attr("class","name")
            .on("mousedown",function(){
                console.log("CLICKED "+that.authorname);
            });

        namebadge.append("circle")
            .style("fill", "green")
            .attr("cx",w/2)
            .attr("cy",h/2)
            .attr("r",innerRadius)
            .attr("text-anchor", "middle")

        namebadge.append("text")
            .text(this.authorname)
            .attr("text-anchor", "middle")
            .attr("dx",w/2)
            .attr("dy",h/2)
            .attr("class","authorname")
            .style("fill","#ffffff");

    //PAPERS not working
    var paperFan = this.bubble.append("g").attr("class","paperFan");

    paperFan.selectAll("text")
        .data(that.paperTitles)
        .enter()
        .append("text")
        .text(function(d,i){
            return d;
        })
        .attr("dx",w/2)
        .attr("dy",h/2)
        .attr("class","paper")
        .style("fill","#000000")
        .append("textPath")
        //.attr("textLength",function(d,i){return 5 ;})
        .attr("xlink:href",function(d,i){return "author"+that.id+"_section"+i;})
        .attr("startOffset",function(d,i){
            return i*2;
        })
        .attr("dy","-1em")
        .text(function(d,i){
            return that.paperTitles.keys[i];
        })
    return this.bubble;


}
