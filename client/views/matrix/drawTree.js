d3.drawTree = class {
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
        var width = this._width || 3;
        var padding = this._padding || 5;
        var height = this._height - padding * 2;
        var conf = Template.matrix.configure;

        var duration = conf.duration;
        var i = 0;

        var tree = d3.layout.tree()
            .size([width, height])

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.x, d.y];
            });

        // Define the root
        root.x0 = width / 2;
        root.y0 = conf.treePadding * 2;

        // Layout the tree initially and center on the root node.
        update(root);

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root);
            var links = tree.links(nodes);

            // // Update the nodes…
            node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

            // // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + source.x0 + "," + (source.y0+padding) + ")";
                })
                .append("circle")
                .attr({
                    class: 'nodeCircle',
                    r: conf.circleR,
                })

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + (d.y+padding) + ")";
                });

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.x + "," + (source.y+padding) + ")";
                })
                .remove()


            // Update the links…
            var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    return diagonal({
                        source: {x:d.source.x, y:d.source.y+padding},
                        target: {x:d.target.x, y:d.target.y+padding},
                    });
                })

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", function(d) {
                    return diagonal({
                        source: {x:d.source.x, y:d.source.y+padding},
                        target: {x:d.target.x, y:d.target.y+padding},
                    });
                });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .remove();

        }

    }
}
