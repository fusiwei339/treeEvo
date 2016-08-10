d3.drawSankey = class {

    constructor(svg, graph) {
        this.svg = svg;
        this.graph = graph;
    }

    xOffset(val){
        this._xOffset=val;
        return this;
    }
    classStr(val){
        this._clsssStr=val;
        return this;
    }
    clickFunc(val){
        this._clickFunc=val;
        return this;
    }

    draw() {
        var xOffset=this._xOffset;
        var classStr=this._clsssStr || '';
        var clickFunc= this._clickFunc || null;

        var conf = Template.flow.configure;
        var animationDur=800;
        var path = d3.sankey().link();

        var nodeSelection = this.svg.selectAll("."+classStr+"node")
            .data(this.graph.nodes, function(d){
                return d.id=d.name;
            })

        console.log(this.graph)
        nodeSelection.enter().append("g")
            .attr("class", classStr+"node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .on('click', clickFunc)
            .append('path')
            .attr('class', classStr+'flowBar')
            .attr('d', function(d){
                return geom.path.begin() 
                    .move_to(0, 0)
                    .line_to(0, d.dx)
                    .line_to(d.dy2, d.dx)
                    .line_to(d.dy1, 0)
                    .close_path()
                    .end();
            })
            .style("fill", function(d) {
                return '#ccc';
            })

        nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .select('path')
            .attr("d", function(d) {
                return geom.path.begin() 
                    .move_to(0, 0)
                    .line_to(0, d.dx)
                    .line_to(d.dy2, d.dx)
                    .line_to(d.dy1, 0)
                    .close_path()
                    .end();
            })

        nodeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()


        var linkSelection = this.svg.selectAll("."+classStr+"sankeyLink")
            .data(this.graph.edges, function(d){
                return d.id=d.source.name+d.target.name;
            })

        linkSelection.enter().append("path")
            .attr("class", classStr+"sankeyLink")
            .attr("d", path)
            .attr("fill", function(d) {
                return '#ddd';
            })
        linkSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()
        linkSelection.transition()
            .duration(animationDur)
            .attr("d", path)

    }
}
