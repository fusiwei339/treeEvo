d3.drawSankey = class {

    constructor(svg, graph) {
        this.svg = svg;
        this.graph = graph;
    }

    classStr(val) {
        this._clsssStr = val;
        return this;
    }
    clickFunc(val) {
        this._clickFunc = val;
        return this;
    }

    draw() {
        var classStr = this._clsssStr || '';
        var clickFunc = this._clickFunc || null;

        var conf = Template.flow.configure;
        var animationDur = 800;
        var path = d3.sankey().link();

        var nodeSelection = this.svg.selectAll("." + classStr + "node")
            .data(this.graph.nodes, function(d) {
                return d.id = d.name;
            })

        nodeSelection.enter().append("g")
            .attr("class", classStr + "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .each(function(d, i) {
                var canvas = d3.select(this);

                canvas.append('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                    })
                var shadowArr = [-10, -5, -2.5]
                canvas.selectAll('.shadowLine')
                    .data(shadowArr).enter()
                    .append('path')
                    .attr('d', e => geom.path.begin()
                        .move_to(d.dy1 + e, 0)
                        .vertical_to(d.dx)
                        .end())
                    .attr('class', 'shadowLine')
                    .attr('stroke', 'steelblue')

                new d3.drawFreqPatterns(canvas, d)
                    .height(d.dx)
                    .width(d.dy1 - 10)
                    .draw()
            })

        var nodeTransition = nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .each(function(d, i){
                var canvas = d3.select(this);

                canvas.select('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                    })
                canvas.selectAll('.shadowLine')
                    .attr('d', e => geom.path.begin()
                        .move_to(d.dy1 + e, 0)
                        .vertical_to(d.dx)
                        .end())

                new d3.drawFreqPatterns(canvas, d)
                    .height(d.dx)
                    .width(d.dy1 - 10)
                    .draw()

            })
        nodeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()


        var linkSelection = this.svg.selectAll("." + classStr + "sankeyLink")
            .data(this.graph.edges, function(d) {
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
