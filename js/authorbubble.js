/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = function(options){
    this.papers = options["papers"];
    this.authorname = options["author"]
    this.canvas = options['canvas'];
    var self = this;

    var w = 300;
    var h = 300;
    this.yearLabels = [];
    this.yearPaperCount = [];


    AuthorBubble.prototype.countPapersFromYear = function(){
        for (var i = 0; i < this.papers.length; i++) {
            this.yearLabels.push(this.papers[i].year);
            this.yearPaperCount.push(this.papers[i].elements.length);
        }
    }
    AuthorBubble.prototype.getGraphic = function(){
        return svg;
    }

    this.countPapersFromYear();

    console.log("creating authorbubble with name: "+this.authorname+", papers:");
    console.log(this.papers);

    var outerRadius = w / 2;
    var innerRadius = 100;
    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.layout.pie();

    //Easy colors accessible via a 10-step ordinal scale
    var color = d3.scale.category10();

    //Create SVG element
    var svg = canvas
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    //Set up groups
    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);

    //Labels
    arcs.append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.value;
        });


    return this.getGraphic();


}
