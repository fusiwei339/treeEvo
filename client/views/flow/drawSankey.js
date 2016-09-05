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

        function getGraidentData(trees) {
            var attr = 'lean';
            var data_temp = _.map(trees, t => {
                var ret = { count: t.count }
                if (attr === 'population') {
                    ret.key = t.pattern.length;
                } else {
                    ret.key = t[attr];
                }
                return ret;
            })

            data_temp.sort((a, b) => a.key - b.key)

            var graidentData = [];
            _.each(data_temp, t => {
                for (let i = 0; i < t.count; i++, graidentData.push(t.key));
            })
            var samplePoints = _.range(0, 1, .01);
            var ret = _.map(samplePoints, p => {
                return {
                    offset: p,
                    value: graidentData[Math.floor(p * graidentData.length)]
                }
            })
            return ret;
        }

        var colorScale = d3.scale.linear()
            .domain([-.5, 0, .5])
            .range(['#b35806', '#fff', '#542788'])

        nodeSelection.enter().append("g")
            .attr("class", classStr + "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .on('click', function(d) {
                Session.set('selectedNode', d.name)

                d3.selectAll(`.${classStr}node`).select('rect')
                    .attr('stroke', '#ccc')
                d3.select(this).select('rect')
                    .attr('stroke', '#666')
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
                    .selectAll('stop').data(getGraidentData(d.trees))
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
                        stroke:'#ccc'
                    })

            })

        var nodeTransition = nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .each(function(d, i) {
                var canvas = d3.select(this)
                var attr = Session.get('distributionName') || 'lean'

                canvas.select('defs')
                    .select('linearGradient')
                    .attr('id', d.name + 'graident')
                    .attr({
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "0%",
                    })
                    .selectAll('stop')
                    .attr('offset', d => d.offset)
                    .style('stop-color', d => colorScale(d.value))
                    .style('stop-opacity', 1)

                canvas.select('rect')
                    .attr({
                        width: d.dy1,
                        height: d.dx,
                        class: 'backgroundRect',
                        fill: `url(#${d.name}graident)`,
                        stroke:'#ccc'
                    })

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
