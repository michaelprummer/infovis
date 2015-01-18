Layouter = function(opts){
    that = this;

    //options
    this.svg = opts["svg"];
    this.height = opts.hasOwnProperty("height") ? opts.height : parseInt($("#svg-container").attr("height"));
    this.width = opts.hasOwnProperty("width") ? opts.width : parseInt($("#svg-container").attr("width"));

    this.parser= opts["parser"];
    this.currentId = 0;
    this.bubbles = [];
    this.rootId = 0;
    this.authors = {};

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    function addSlashes(str){
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }

    Layouter.prototype.hasAuthor = function(data,name){
        for (var i = 0; i < data.length; i++) {
            if(data[i].author==name) return true;

        }
        return false;
    }
    Layouter.prototype.addEdge = function(data,name,addval){
        for (var i = 0; i < data.length; i++) {
            if(data[i].hasOwnProperty("connections") && data[i].author==name) data[i]["connections"].push(addval);
        }
    }

    Layouter.prototype.generateRootBubble = function(opts){
        opts["id"] = this.currentId;
        opts["root"] = true;
        opts["x"] = 0;
        opts["y"] = 0;
        var bubble = new AuthorBubble(opts)
        this.bubble= bubble;
        this.bubbles[this.currentId] = bubble;

        this.rootId = this.currentId;
        this.currentId++;

        $(".paper").tooltip({
            position: { my: "left+15 bottom", at: "right center" }
        });


        // loop through co-authors
        var missingauthors = [];
        var edges = {};
        var d3data = [];


        for (var i = 0; i < bubble.papers.length; i++) {
            for (var j = 0; j < bubble.papers[i].elements.length; j++) {
                for (var k = 0; k < bubble.papers[i].elements[j].authors.length; k++) {
                    var author = bubble.papers[i].elements[j].authors[k];

                    if(!(author == bubble.authorname)){
                        if($.inArray(author,missingauthors) == -1){
                            missingauthors.push(author);
                            // Edge: [<authorname>->[paperid1,paperid2...]]
                            edges[author] = [];
                            d3data.push({author:author,connections:[]})

                        }
                        if(edges.hasOwnProperty(author)){
                            edges[author].push(bubble.papers[i].elements[j].paper_index);
                            this.addEdge(d3data,author,bubble.papers[i].elements[j].paper_index)
                        }

                    }
                }
            }
        }

        for (var k = 0; k < missingauthors.length; k++) {

            var angle = (360/missingauthors.length)*k-85;
            var cx = bubble.canvasWidth/4;
            var cy = bubble.canvasHeight/4;
            var r = (bubble.papers_count*50).clamp(bubble.outerRadius + 550, 1200);
            var x = cx + r/2 * Math.cos(angle*0.0174532925);
            var y = cy + r/2 * Math.sin(angle*0.0174532925);

            opts.author = addSlashes(missingauthors[k]);
            opts.x = x;
            opts.y = y;
            opts.root = false;
            opts.width= 150;
            opts.height = 150;
            opts.papers = null;

            var g = this.svg.append("g").attr("class","coauthor").attr("transform","translate(0,0)");

            opts.svg = g;
            opts.r = (edges[missingauthors[k]].length*5).clamp(25,75);
            var b = this.generateBubble(opts);
           // edges
            if(edges.hasOwnProperty([opts.author])) {
                for (var l = 0; l < edges[opts.author].length; l++) {
                    var paperid = edges[opts.author][l];

                    /**
                     * Paper Point
                     */
                    var pointPaper = this.bubble.getPaperPosition(paperid);

                    /**
                     * Author Point
                     */
                    var ele = $(".authorBubble .name[id='" + opts.author + "']").parent();
                    ele = ele.attr("transform").replace("translate(", "").replace(")", "");
                    ele = ele.split(",")
                    var pointAuthor = [ele[0], ele[1]];


                    var pointAuthor = [x + bubble.canvasWidth / 4, y + bubble.canvasHeight / 4];
                    var lineData = [{x: pointPaper[0], y: pointPaper[1]}, {x: pointAuthor[0], y: pointAuthor[1]}];

                    var lineFunction = d3.svg.line()
                        .x(function (d) {
                            return d.x;
                        })
                        .y(function (d) {
                            return d.y;
                        })
                        .interpolate("basis");

                    g.append("path")
                        .attr("d", lineFunction(lineData))
                        .style("stroke", "#4A4A4A")
                        .attr("paperid", paperid);
                }
            }

        }
        // reorder bubbles
        that.svg.selectAll(".authorBubble").moveToFront();

        // highllight author and connection on paper hover
        this.svg.selectAll(".paper")
            .on("mouseover",function(ev){
                if(that.bubble.detailView){
                    id = d3.select(this).select("g").style("font-weight","bold").attr("index")

                    d3.selectAll(".coauthor path[paperid='"+id+"']").transition().style("opacity",1).each(function(d,i){
                        d3.select(this.parentNode).select(".name").transition().style("opacity",1)
                    })

                }
            })

            .on("mouseout",function(ev){
                if(that.bubble.detailView){
                    id = d3.select(this).select("g").style("font-weight","normal").attr("index")

                    d3.selectAll(".coauthor path[paperid='"+id+"']").transition().style("opacity",.2).each(function(d,i){
                        d3.select(this.parentNode).select(".name").transition().style("opacity",.2)
                    })
                }
            });

        return bubble;
    }

    Layouter.prototype.generateBubble = function(opts){
        opts["id"] = this.currentId;
        opts["root"] = false;
        opts["papers"] = null;
        var bubble = new AuthorBubble(opts)
        bubble.bubble.on("click",function(ev){
            var name = bubble.authorname.split(" ");


           that.parser.callApi({name:name[name.length-1]});
        });
        this.bubbles[this.currentId] = bubble;
        this.currentId++;
        return bubble;
        // loop through co-authors
    }




}
