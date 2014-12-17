/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = function(options){
    this.papers = options["papers"];
    this.authorname = options["author"]
    this.svg = options['svg'];
    var self = this;

    this.yearLabels = [];
    this.yearPaperCount = [];


    AuthorBubble.prototype.countPapersFromYear = function(){
        for (var i = 0; i < this.papers.length; i++) {
            this.yearLabels.push(this.papers[i].year);
            this.yearPaperCount.push(this.papers[i].elements.length);
        }
    }

    this.countPapersFromYear();

    console.log("creating authorbubble with name: "+this.authorname+", papers:");

    // ACTIVITY PIE
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

        var group = this.svg.append("g").attr("transform", "translate(" + w + "," + h + ")");

        //Set up groups
        var arcs = this.svg.selectAll(".arc")
            .data(pie(this.yearPaperCount))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

        console.log(arcs);
        //Draw arc paths
        arcs.append("path")
            .attr("d", arc)
            .attr("fill"    , function(d, i) {
            return color(i);
        });

        //Labels
        arcs.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.data;
            });


    return group;


}
