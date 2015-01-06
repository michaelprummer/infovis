Layouter = function(opts){
    that = this;

    //options
    this.svg = opts["svg"];
    this.height = opts.hasOwnProperty("height") ? opts.height : parseInt($("#svg-container").attr("height"));
    this.width = opts.hasOwnProperty("width") ? opts.width : parseInt($("#svg-container").attr("width"));

    this.parser= null;
    this.currentId = 0;
    this.bubbles = {};
    this.authors = {};


    Layouter.prototype.generateRootBubble = function(opts){
        opts["id"] = this.currentId;
        opts["root"] = true;
        opts["x"] = this.width/2;
        opts["y"] = this.height/2;
        var bubble = new AuthorBubble(opts)
        this.bubbles[this.currentId] =bubble;
        this.currentId++;

        // loop through co-authors
        missingauthors = [];
        edges = [];

        for (var i = 0; i < bubble.papers.length; i++) {
            for (var j = 0; j < bubble.papers[i].elements.length; j++) {
                for (var k = 0; k < bubble.papers[i].elements[j].authors.length; k++) {
                    if(!(bubble.papers[i].elements[j].authors[k] == bubble.authorname)){
                        if($.inArray(bubble.papers[i].elements[j].authors[k],missingauthors) == -1){
                            missingauthors.push(bubble.papers[i].elements[j].authors[k]);
                            edges.push([i,this.currentId]);

                        }
                    }
                }
            }
        }
        console.log("missing authors:");
        console.log(missingauthors);
        /**
        // generate their bubbles
        for (var k = 0; i < missingauthors.length; k++) {
            var angle = (360/missingauthors.length)*k-85;
            var cx = (this.width/2);
            var cy = (this.height/2);
            var r = 450;
            var x = cx + r *Math.cos(angle*0.0174532925);
            var y = cy + r *Math.sin(angle*0.0174532925);

            opts.author = missingauthors[k];
            opts.x = x;
            opts.y = y;
            opts.width= 150;
            opts.height = 150;
            this.generateBubble(opts);

        }

        for (var e = 0; e < edges.length; e++) {
            var obj = edges[e];
            d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate("basis");
        }**/

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
