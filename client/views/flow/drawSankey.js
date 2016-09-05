d3.drawSankey = class {

    constructor(svg, graph) {
        this.svg = svg;
        this.graph = graph;
    }

    classStr(val) {
        this._clsssStr = val;
        return this;
    }
    depthLimit(val) {
        this._depthLimit = val;
        return this;
    }

    draw() {
        var classStr = this._clsssStr || '';
        var depthLimit = this._depthLimit || null;

        var conf = Template.flow.configure;
        var animationDur = 800;
        var path = d3.sankey().link();

        var nodeSelection = this.svg.selectAll("." + classStr + "node")
            .data(this.graph.nodes.filter(d => d.depth <= depthLimit), function(d) {
                return d.id = d.name;
            })

        nodeSelection.enter().append("g")
            .attr("class", classStr + "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .on('click', function(d) {
                Session.set('sourceTrees', d.trees)

                d3.selectAll(`.${classStr}node`).select('rect')
                    .attr('stroke', 'steelblue')
                d3.select(this).select('rect')
                    .attr('stroke', '#ef8a62')
            })
            .each(function(d, i) {
                var canvas = d3.select(this);
                var attr = Session.get('distributionName') || 'lean'

                canvas.append('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                        stroke: 'steelblue'
                    })

                // new d3.drawDistribution(canvas, d)
                //     .width(d.dy1)
                //     .height(d.dx)
                //     .attr(attr)
                //     .draw()

            })

        var nodeTransition = nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .each(function(d, i) {
                var canvas = d3.select(this)
                var attr = Session.get('distributionName') || 'lean'

                canvas.select('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                    })

                // new d3.drawDistribution(canvas, d)
                //     .width(d.dy1)
                //     .height(d.dx)
                //     .attr(attr)
                //     .draw()

            })
        nodeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()


        var linkSelection = this.svg.selectAll("." + classStr + "sankeyLink")
            .data(this.graph.edges.filter(d => d.target.depth <= depthLimit), function(d) {
                return d.id = d.source.name + d.target.name;
            })

        linkSelection.enter().append("path")
            .attr("class", classStr + "sankeyLink")
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
