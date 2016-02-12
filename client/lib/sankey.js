d3.sankey = function() {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        scaleFunc = undefined,
        links = [];

    sankey.scaleFunc = function(_) {
        if (!arguments.length) return scaleFunc;
        scaleFunc = _;
        return sankey;
    };

    sankey.nodeWidth = function(_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function(_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function(_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function(_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function() {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths();
        computeLinkDepths();
        return sankey;
    };

    sankey.relayout = function() {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function() {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                l1y0 = d.source.y + d.sy,
                l2y0 = d.source.y + d.sy + d.sourcedy,
                l1y1 = d.target.y + d.ty,
                l2y1 = d.target.y + d.ty + d.targetdy;
            return geom.path.begin()
                .move_to(x0, l1y0)
                .bezier_to(x2, l1y0, x3, l1y1, x1, l1y1)
                .line_to(x1, l2y1)
                .bezier_to(x3, l2y1, x2, l2y0, x0, l2y0)
                .close_path()
                .end();
        }

        return link;
    };

    function computeNodeLinks() {
        nodes.forEach(function(node) {
            node.sourceLinks = [];
            node.targetLinks = [];
        });
        links.forEach(function(link) {
            var source = link.source,
                target = link.target;
            if (typeof source === "number") source = link.source = nodes[link.source];
            if (typeof target === "number") target = link.target = nodes[link.target];
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(scaleFunc);
    }

    function computeNodeBreadths() {
        x = 0;

        nodes.forEach(function(node) {
            node.x = node.generation;
            node.dx = nodeWidth;
            x = Math.max(x, node.x);
        })
        scaleNodeBreadths((size[0] - nodeWidth) / (x + 1));
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function(node) {
            node.x *= kx;
        });
    }

    function computeNodeDepths() {
        var nodesByBreadth = d3.nest()
            .key(function(d) {
                return d.x;
            })
            .sortKeys(d3.descending)
            .entries(nodes)
            .map(function(d) {
                return d.values;
            });

        initializeNodeDepth();

        function sortVerti(a, b) {
            // return a.man.length - b.man.length;
            return b.cluster - a.cluster;
        }

        _.each(nodesByBreadth, function(nodes, breadth) {
            nodes.sort(sortVerti)
            _.each(nodes, function(node, i) {
                if (i == 0)
                    node.y = 0;
                else
                    node.y = nodes[i - 1].y + nodes[i - 1].dy + nodePadding;
            })
        })

        function initializeNodeDepth() {
            var nPeople = 0,
                nCluster = 0;
            _.each(nodes, function(node) {
                if (node.generation == 1) {
                    nPeople += node.man.length;
                    nCluster++;
                }
            })

            var ky = d3.min(nodesByBreadth, function(nodes) {
                return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
            });

            nodesByBreadth.forEach(function(nodes) {
                nodes.forEach(function(node, i) {
                    node.y = i;
                    node.dy = ky * node.value;
                });
            });

            links.forEach(function(link) {
                link.sourcedy = link.sourcePart * link.source.dy;
                link.targetdy = link.targetPart * link.target.dy;
            });
        }

    }

    function computeLinkDepths() {
        nodes.forEach(function(node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function(node) {
            var sy = 0,
                ty = 0;
            node.sourceLinks.forEach(function(link) {
                link.sy = sy;
                sy += link.sourcedy;
            });
            node.targetLinks.forEach(function(link) {
                link.ty = ty;
                ty += link.targetdy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};
