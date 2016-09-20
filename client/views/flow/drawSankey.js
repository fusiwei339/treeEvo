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

        var flow_conf = Template.flow.configure;
        var conf = Template.option.configure;
        var animationDur = 800;
        var path = d3.sankey().link();
        var sliceOffset = 4;
        var attr = Session.get('distributionName') || 'lean'

        var nodeSelection = this.svg.selectAll("." + classStr + "node")
            .data(this.graph.nodes.filter(d => d.depth <= depthLimit), function(d) {
                return d.id = d.name;
            })

        var colorScale = conf.graidentColorScale[attr]
            .domain(conf.graidentColorDomain[attr])
            .range(conf.graidentColorRange[attr])

        nodeSelection.enter().append("g")
            .attr("class", classStr + "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .on('click', function(d) {
                if (d3.event.shiftKey) {
                    var foundElem = flow_conf.involvedNodes.find(e => e.name === d.name)
                    if (foundElem) {
                        flow_conf.involvedNodes.remObjByKey('name', d.name);
                        d3.select(this).select('.backgroundRect')
                            .attr('stroke', '#000')
                            .attr('stroke-width', .3)
                    } else {
                        flow_conf.involvedNodes.push(d);
                        d3.select(this).select('.backgroundRect')
                            .attr('stroke', d3.googleColor(d.name))
                            .attr('stroke-width', 4)
                    }
                    d3.googleColor.domain(flow_conf.involvedNodes.map(d => d.name))
                    Session.set('changeInvolvedNodes', new Date());

                } else if (d3.event.altKey) {
                    //draw line
                    var coord = d3.mouse(this);
                    var g = d3.select(this);
                    g.append('path')
                        .attr('class', 'slice')
                        .attr('offset', coord[0] / d.dy1)
                        .attr('d', function() {
                            return geom.path.begin()
                                .move_to(coord[0] - sliceOffset, 0)
                                .line_to(coord[0] - sliceOffset, d.dx)
                                .end()
                        })

                    d3.selectAll(`.${classStr}node`).filter(e => e.name !== d.name)
                        .selectAll('.slice')
                        .remove();

                    var elemArr = g.selectAll('.slice').map(d => d)
                    flow_conf.percentArr = _.map(elemArr[0], elem => {
                        return +d3.select(elem).attr('offset')
                    }).sort((a, b) => a - b);

                } else {
                    d3.selectAll(`.${classStr}node`)
                        .selectAll('.slice')
                        .remove();
                    flow_conf.involvedNodes = [d];
                    d3.googleColor.domain([d.name])

                    Session.set('changeInvolvedNodes', new Date());

                    d3.selectAll(`.${classStr}node`).select('rect')
                        .attr('stroke', '#000')
                        .attr('stroke-width', .3)
                    d3.select(this).select('.backgroundRect')
                        .attr('stroke', d3.googleColor(d.name))
                        .attr('stroke-width', 4)
                }

            })
            .on('mouseenter', function(e) {
                var g = d3.select(this);
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

                canvas.append('defs')
                    .append('linearGradient')
                    .attr('id', d.name + 'graident')
                    .attr({
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "0%",
                    })
                    .selectAll('stop').data(dataProcessor.getGraidentData(d.trees, attr))
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
                        stroke: 'black',
                        'stroke-width': .3,
                    })

            })

        var nodeTransition = nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .each(function(d, i) {
                var canvas = d3.select(this);

                canvas.select('defs')
                    .select('linearGradient')
                    .attr('id', d.name + 'graident')
                    .attr({
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "0%",
                    })
                    .selectAll('stop').data(dataProcessor.getGraidentData(d.trees, attr))
                    .attr('offset', d => d.offset)
                    .style('stop-color', d => colorScale(d.value))
                    .style('stop-opacity', 1)
            })
            .select('rect')
            .attr('width', d => d.dy1)
            .attr('height', d => d.dx)
            .attr('fill', d => `url(#${d.name}graident)`)
            .attr({
                class: 'backgroundRect',
                stroke: 'black',
                'stroke-width': .3,
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
