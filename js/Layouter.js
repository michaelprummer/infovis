Layouter = function(opts){
    that = this;

    //options
    this.svg = opts["svg"];
    this.height = opts.hasOwnProperty("height") ? opts.height : parseInt($("#svg-container").attr("height"));
    this.width = opts.hasOwnProperty("width") ? opts.width : parseInt($("#svg-container").attr("width"));

    this.parser= null;
    this.currentId = 0;
    this.bubbles = [];
    this.rootId = 0;
    this.authors = {};


    Layouter.prototype.generateRootBubble = function(opts){
        opts["id"] = this.currentId;
        opts["root"] = true;
        opts["x"] = 0;
        opts["y"] = 0;
        var bubble = new AuthorBubble(opts)
        this.bubbles[this.currentId] =bubble;
        this.rootId = this.currentId;
        this.currentId++;

        // loop through co-authors
        var missingauthors = [];
        var edges = {};

        var paperId = 0;

        for (var i = 0; i < bubble.papers.length; i++) {
            for (var j = 0; j < bubble.papers[i].elements.length; j++) {
                paperId++;
                for (var k = 0; k < bubble.papers[i].elements[j].authors.length; k++) {
                    var author = bubble.papers[i].elements[j].authors[k];

                    if(!(author == bubble.authorname)){
                        if($.inArray(author,missingauthors) == -1){
                            missingauthors.push(author);
                            // Edge: [<papertitle>,<index in missingauthors>]
                            edges[author] = [];

                        }
                        if(edges.hasOwnProperty(author)){
                            edges[author].push(paperId);
                        }

                    }
                }
            }
        }
        console.log("missing authors:");
        console.log(edges);
        // generate their bubbles

        for (var k = 0; k < missingauthors.length; k++) {

            var angle = (360/missingauthors.length)*k-85;
            var cx = bubble.canvasWidth/4;
            var cy = bubble.canvasHeight/4;
            var r = (bubble.papers_count*20).clamp(350, 900);
            var x = cx + r *Math.cos(angle*0.0174532925);
            var y = cy + r *Math.sin(angle*0.0174532925);

            opts.author = missingauthors[k];
            opts.x = x;
            opts.y = y;
            opts.root = false;
            opts.width= 150;
            opts.height = 150;
            opts.papers = null;

            this.generateBubble(opts);
            if(edges[opts.author]){console.log(edges[opts.author])}else{console.log("keine kante...")}
            for (var l = 0; l < edges[opts.author].length; l++) {
                var paperid = edges[opts.author][l];

                var pointPaper = this.bubbles[this.rootId].getPaperPosition(paperid);
                var pointAuthor = [x,y];
                this.svg.append("line")
                    .attr("x1",pointPaper[0]+this.width/2-100)
                    .attr("y1",pointPaper[1]+this.height/2-100)
                    .attr("x2",pointAuthor[0]+this.width/2-100)
                    .attr("y2",pointAuthor[1]+this.height/2-100)
                    .style("stroke","#000")

            }



        }




        return bubble;

    }

    Layouter.prototype.generateBubble = function(opts){
        opts["id"] = this.currentId;
        opts["root"] = false;
        opts["papers"] = null;
        var bubble = new AuthorBubble(opts)
        this.bubbles[this.currentId] = bubble;
        this.currentId++;
        return bubble;
        // loop through co-authors
    }

    Layouter.prototype.setParser = function(parser) {
        this.parser = parser;
    }
}
