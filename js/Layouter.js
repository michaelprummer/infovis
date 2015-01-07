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
        console.log("missing authors:");
        console.log(d3data);
        // generate their bubbles
        /*
        this.svg.selectAll("g.coauthor")
            .data(d3data)
            .enter()
            .append("g")
            .attr("class","coauthor")
            .each(function(d,i){
                d3.select(this).append("text").text(function(d,i){return d.name});
                var angle = (360/d.length)*i-85;
                var cx = bubble.canvasWidth/4;
                var cy = bubble.canvasHeight/4;
                var r = (bubble.papers_count*20).clamp(350, 900);
                var x = cx + r/2 * Math.cos(angle*0.0174532925);
                var y = cy + r/2 * Math.sin(angle*0.0174532925);

                opts.author = d.author;


                for (var j = 0; j < d.connections.length; j++) {

                    var paperid = d.connections[j];

                    // Sollte man irgendwie gleich als Attribut ablegen :D
                    var ele = d3.select("g.paper[paper_id='" + paperid + "']");
                    ele = ele.attr("transform").split(") rotate(")[0].replace("translate(","");
                    ele = ele.split(", ")
                    var pointPaper = [ele[0], ele[1]];

                    var ele = d3.select(".authorBubble .name[id='" + opts.author + "']").node().parentNode;
                    ele = d3.select(ele).attr("transform").replace("translate(","").replace(")","");
                    ele = ele.split(",")
                    var pointAuthor = [ele[0], ele[1]];


                    console.log(r)
                    var pointAuthor = [x + bubble.canvasWidth/4, y + bubble.canvasHeight/4];
                    d3.select(this).append("line")
                        .attr("x1",pointPaper[0])
                        .attr("y1",pointPaper[1])
                        .attr("x2",pointAuthor[0])
                        .attr("y2",pointAuthor[1])
                        .style("stroke","#4A4A4A")


                }

            })

        */
        for (var k = 0; k < missingauthors.length; k++) {

            var angle = (360/missingauthors.length)*k-85;
            var cx = bubble.canvasWidth/4;
            var cy = bubble.canvasHeight/4;
            var r = (bubble.papers_count*40).clamp(350, 1200);
            var x = cx + r/2 * Math.cos(angle*0.0174532925);
            var y = cy + r/2 * Math.sin(angle*0.0174532925);

            opts.author = missingauthors[k];
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

            for (var l = 0; l < edges[opts.author].length; l++) {
                var paperid = edges[opts.author][l];

                /**
                 * Paper Point
                 */
                // Sollte man irgendwie gleich als Attribut ablegen :D kann man ja in bubble.translate.x speichern
                /*var ele = $("g.paper[paper_id='" + paperid + "']");
                ele = ele.attr("transform").split(") rotate(")[0].replace("translate(","");
                ele = ele.split(", ");*/
                var pointPaper = this.bubble.getPaperPosition(paperid);

                /**
                 * Author Point
                 */
                var ele = $(".authorBubble .name[id='" + opts.author + "']").parent();
                ele = ele.attr("transform").replace("translate(","").replace(")","");
                ele = ele.split(",")
                var pointAuthor = [ele[0], ele[1]];


                var pointAuthor = [x + bubble.canvasWidth/4, y + bubble.canvasHeight/4];
                var lineData = [{x:pointPaper[0],y:pointPaper[1]},{x:pointAuthor[0],y:pointAuthor[1]}];

                var lineFunction = d3.svg.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .interpolate("basis");

                g.append("path")
                    .attr("d",lineFunction(lineData))
                    .style("stroke","#4A4A4A")
                    .attr("paperid",paperid);
            }

        }
        this.svg.selectAll(".paper")
            .on("mouseover",function(ev){
                id = d3.select(this).select("g").style("font-weight","bold").attr("index")

                d3.selectAll(".coauthor path[paperid='"+id+"']").transition().style("opacity",1).each(function(d,i){
                    d3.select(this.parentNode).select(".name").transition().style("opacity",1).style("fill","green")
                })
            })

        .on("mouseout",function(ev){
            id = d3.select(this).select("g").style("font-weight","normal").attr("index")

                d3.selectAll(".coauthor path[paperid='"+id+"']").transition().style("opacity",.2).each(function(d,i){
                    d3.select(this.parentNode).select(".name").transition().style("opacity",.2)
                })
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
