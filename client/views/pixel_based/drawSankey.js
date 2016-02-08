d3.drawSankey=class {

    constructor(svg, graph, sankey) {
        this.svg = svg;
        this.graph = graph;
        this.sankey = sankey;
    }

    draw () {
        // add in the nodes
        var path = this.sankey.link();
        var colorDomain=_.uniq(_.map(this.graph.nodes, function(node){
            return node.cluster;
        }))
        var color = d3.scale.category20()
            .domain(colorDomain)

        var node = this.svg.append("g").selectAll(".node")
            .data(this.graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
                .origin(function(d) {
                    return d;
                })
                .on("dragstart", function() {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove)
            );

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", this.sankey.nodeWidth())
            .style("fill", function(d) {
                return color(d.cluster);
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2);
            })

        // console.log(this.graph.links)
        var link = this.svg.append("g").selectAll(".link")
            .data(this.graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr('title', function(d){
                return d.source.name+'--'+d.target.name+'--'+d.value;
            })


        function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + d.x + "," + (
                    d.y = Math.max(0, Math.min(this.sankey.height() - d.dy, d3.event.y))
                ) + ")");
            this.sankey.relayout();
            link.attr("d", path);
        }

    }
}

//现在我在大陆，想把文件分享给同学，试了金山快盘，发现它现在不支持文件外链，用了微云和QQ中转站，发现微云速度更快！
