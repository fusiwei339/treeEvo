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
    color(val){
        this._color=val;
        return this;
    }
    clickFunc(val){
        this._clickFunc=val;
        return this;
    }

    draw() {
        var xOffset=this._xOffset;
        var classStr=this._clsssStr || '';
        var color=this._color;
        var clickFunc= this._clickFunc || null;

        var conf = Template.lineage.configure;
        var animationDur=conf.animationDur;
        var path = d3.sankey().link();

        var nodeSelection = this.svg.selectAll("."+classStr+"node")
            .data(this.graph.nodes, function(d){
                return d.id=d.name;
            })

        nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + (d.x+xOffset) + "," + d.y + ")";
            })
            .select('rect')
            .attr("height", function(d) {
                return d.dy;
            })

        nodeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()
        nodeSelection.enter().append("g")
            .attr("class", classStr+"node")
            .attr("transform", function(d) {
                return "translate(" + (d.x+xOffset) + "," + d.y + ")";
            })
            .on('click', clickFunc)
            .append("rect")
            .attr('class', classStr+'flowBar')
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", function(d){
                return d.dx-xOffset*2;
            })
            .style("fill", function(d) {
                return color(d.cluster);
            })

        var linkSelection = this.svg.selectAll("."+classStr+"link")
            .data(this.graph.links, function(d){
                return d.id=d.source.name+d.target.name;
            })

        linkSelection.enter().append("path")
            .attr("class", classStr+"link")
            .attr("d", path)
        linkSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()
        linkSelection.transition()
            .duration(animationDur)
            .attr("d", path)

    }
}
