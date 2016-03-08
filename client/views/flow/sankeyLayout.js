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
        var names = nodes.map(function(e) {
            return e.name;
        })
        links.forEach(function(link) {
            link.source = names.indexOf(link.source);
            link.target = names.indexOf(link.target);
        });
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
        Template.flow.configure.rectWidth = kx;
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
            return b.vertiSort - a.vertiSort;
        }

        _.each(nodesByBreadth, function(nodes, breadth) {
            nodes.sort(sortVerti)
            _.each(nodes, function(node, i) {
                if (i == 0)
                    node.y = 0;
                else
                    node.y = nodes[i - 1].y + Math.max(nodes[i - 1].dy2, nodes[i - 1].dy1) + nodePadding;
            })
        })

        function initializeNodeDepth() {
            var nPeople = 0,
                nCluster = 0;

            var nPeople = d3.max(nodesByBreadth, function(nodes) {
                var v = d3.sum(nodes, function(node) {
                    return Math.max(node.value1, node.value2);
                })
                return v;
            })
            var nCluster = nodesByBreadth[0].length;


            var ky = d3.scale.linear()
                .domain([0, nPeople])
                .range([0, size[1] - nCluster * nodePadding])

            nodesByBreadth.forEach(function(nodes) {
                nodes.forEach(function(node, i) {
                    node.y = i;
                    node.dy1 = ky(node.value1);
                    node.dy2 = node.value2 == 0 ? ky(node.value1) : ky(node.value2);
                    // node.dy2 = Math.max(ky(node.value2), node.dy1);
                });
            });

            links.forEach(function(link) {
                link.sourcedy = link.sourcePart * link.source.dy2;
                link.targetdy = link.targetPart * link.target.dy1;
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

    function value(link) {
        return link.value;
    }

    return sankey;
};
