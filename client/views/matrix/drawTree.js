d3.drawTree = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    generation(val) {
        this._generation = val;
        return this;
    }
    nSons(val) {
        this._sons = val;
        return this;
    }

    draw() {

        var root = this.data;
        var svg = this.svg;
        var generation = this._generation || 3;
        var nSons = this._sons || 3;

        var maxLabelLength = 20;
        var duration = 750;
        var i = 0;
        var nodeSize=5;

        // size of the diagram
        var viewerWidth = svg.attr('width');
        var viewerHeight = svg.attr('height');

        var tree = d3.layout.tree()
            .separation((a, b) => a.parent == b.parent ? 1 : 2)
            .nodeSize([nodeSize, nodeSize])

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.x, d.y];
            });

        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", () => {
                svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });

        svg.call(zoomListener);
        var svgGroup = svg.append("g");

        // Define the root
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root);
            _.each(nodes, node => {
                if (!node.parent) {
                    node.shink = false;
                    return;
                }
                let flag = +node.birthOrder >= nSons ||
                    +node.gen >= generation ||
                    +node.parent.birthOrder >= nSons ||
                    +node.parent.gen >= generation;

                node.shink = flag ? true : false;
            })
            var links = tree.links(nodes);

            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function(d) {
                d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            });

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
                .append("rect")
                .attr('class', 'nodeCircle')
                .attr('width', d=>{
                	return d.shink?1:5;
                })
                .attr("height", d => {
                    return d.shink ? 1 : 5;
                })
                .attr({
                    x:-2.5,
                    y:-2.5
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
                .select("circle")
                .attr("r", 0);


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
