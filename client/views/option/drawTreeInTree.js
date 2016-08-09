d3.drawTreeInTree = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    height(val) {
        this._height = val;
        return this;
    }
    width(val) {
        this._width = val;
        return this;
    }
    padding(val) {
        this._padding = val;
        return this;
    }

    draw() {

        var root = this.data;
        var svgGroup = this.svg;
        var width = this._width;
        var padding = this._padding;
        var height = this._height - padding * 2;
        var conf = Template.option.configure;
        var dataProcessor = Template.matrix.dataProcessor;

        var duration = conf.animationDur;
        var i = 0;

        var tree = d3.layout.tree()
            .size([width, height])


        // Layout the tree initially and center on the root node.
        update(root);

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root);
            var links = tree.links(nodes);

            var groupByDepth = d3.nest().key((d) => d.depth).entries(nodes)
            _.each(groupByDepth, depth => {
                _.each(depth.values, (e, i) => {
                    e.idx = i;
                })
            })

            var maxWidth = d3.max(groupByDepth, depth => depth.values.length);
            var xDomain = Array.from(Array(maxWidth).keys())

            var xScale = d3.scale.ordinal()
                .domain(xDomain)
                .rangeBands([padding, width - padding])

            var rectWidth = xScale.rangeBand() - padding;
            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });

            var yScale = d3.scale.linear()
                .domain([1, 7])
                .range([0, 800])

            // // Update the nodes…
            node = svgGroup.selectAll("g.TITnode")
                .data(nodes.filter((d) => d.pattern !== 'root'), function(d) {
                    return d.id || (d.id = ++i);
                });

            // // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "TITnode")
                .attr("transform", function(d) {
                    return "translate(" + (d.x = xScale(d.idx)) + "," + (d.y = yScale(d.depth)) + ")";
                })
                .each(function(d, i) {
                    var canvas = d3.select(this);
                    d.rectWidth = rectWidth;
                    d.rectHeight = rectWidth + (d.depth - 1) * 10;

                    canvas.append('rect')
                        .attr({
                            class: 'TITBackground',
                            width: d.rectWidth,
                            height: d.rectHeight,
                            fill: '#eee'
                        })

                    var tree = dataProcessor.seq2tree(d.pattern)
                    new d3.drawTree(canvas, tree)
                        .height(d.rectHeight)
                        .width(d.rectWidth)
                        .padding(5)
                        .draw()
                })

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d, i) {
                    return "translate(" + d.x + "," + d.y + ")";
                })

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .remove()


            // Update the links…
            let filteredlinks = _.filter(links, d => d.source.pattern !== 'root');

            var link = svgGroup.selectAll("path.TITlink")
                .data(filteredlinks, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "TITlink")
                .attr("d", d => {
                    var o={
                        source:{x:d.source.x+d.source.rectWidth/2, y:d.source.y+d.source.rectHeight},
                        target:{x:d.target.x+d.target.rectWidth/2, y:d.target.y},
                    }
                    return diagonal(o);
                })

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", d => {
                    var o={
                        source:{x:d.source.x+d.source.rectWidth/2, y:d.source.y+d.source.rectHeight},
                        target:{x:d.target.x+d.target.rectWidth/2, y:d.target.y},
                    }
                    return diagonal(o);
                })

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .remove();

        }
    }
}
