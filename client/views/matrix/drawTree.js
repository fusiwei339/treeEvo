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
        this._padding= val;
        return this;
    }

    draw() {

        var root = this.data;
        var svgGroup = this.svg;
        var width = this._width || 3;
        var padding= this._padding|| 0;
        var height = this._height-padding*2;
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
                    return "translate(" + source.x0 + "," + source.y0 + ")";
                })
                .append("circle")
                .attr({
                    class: 'nodeCircle',
                    r: conf.circleR,
                })
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove()


            // Update the links…
            let filteredlinks = _.filter(links, d => {
                return !d.target.shink && !d.source.shink
            })
            var link = svgGroup.selectAll("path.link")
                .data(filteredlinks, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

        }

    }
}
