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
        var dataProcessor = Template.option.dataProcessor;

        var conf = Template.flow.configure;
        var animationDur = 800;
        var path = d3.sankey().link();
        var sliceOffset=4;

        var nodeSelection = this.svg.selectAll("." + classStr + "node")
            .data(this.graph.nodes.filter(d => d.depth <= depthLimit), function(d) {
                return d.id = d.name;
            })

        var colorScale = d3.scale.linear()
            .domain([-.5, 0, .5])
            .range(['#b35806', '#fff', '#542788'])

        nodeSelection.enter().append("g")
            .attr("class", classStr + "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .on('click', function(d) {
                if (d3.event.shiftKey) {
                    console.log(d.name)
                } else {
                    Session.set('selectedNode', d.name)
                    var g = d3.select(this);
                    d3.selectAll(`.${classStr}node`).select('rect')
                        .attr('stroke', '#ccc')
                    d3.select(this).select('rect')
                        .attr('stroke', '#666')
                }

                var coord = d3.mouse(this);
                //draw line
                g.append('path')
                    .attr('class', 'slice')
                    .attr('d', function() {
                        return geom.path.begin()
                            .move_to(coord[0] - sliceOffset, 0)
                            .line_to(coord[0] - sliceOffset, d.dx)
                            .end()
                    })
            })
            .on('mouseenter', function(e) {
                var g = d3.select(this);
                var coord = d3.mouse(this);
                g.append('path')
                    .attr('class', 'moving')

            })
            .on('mouseout', function(e) {
                //remove temp lines
                var g = d3.select(this);
                g.selectAll('.moving').remove();

            })
            .on('mousemove', function(e) {
                //show line
                var g = d3.select(this);
                var coord = d3.mouse(this);
                g.selectAll('.moving')
                    .attr('d', function() {
                        return geom.path.begin()
                            .move_to(coord[0] - sliceOffset, 0)
                            .line_to(coord[0] - sliceOffset, e.dx)
                            .end()
                    })

            })
            .each(function(d, i) {
                var canvas = d3.select(this);
                var attr = Session.get('distributionName') || 'lean'

                canvas.append('defs')
                    .append('linearGradient')
                    .attr('id', d.name + 'graident')
                    .attr({
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "0%",
                    })
                    .selectAll('stop').data(dataProcessor.getGraidentData(d.trees))
                    .enter().append('stop')
                    .attr('offset', d => d.offset)
                    .style('stop-color', d => colorScale(d.value))
                    .style('stop-opacity', 1)

                canvas.append('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                        fill: `url(#${d.name}graident)`,
                        stroke: '#ccc'
                    })

            })

        var nodeTransition = nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .select('rect')
            .attr('width', d => d.dy1)
            .attr('height', d => d.dx)
            .attr('fill', d => `url(#${d.name}graident)`)
            .attr({
                class: 'backgroundRect',
                stroke: '#ccc'
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
