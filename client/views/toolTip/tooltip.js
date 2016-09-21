Template.tooltipSankey.rendered = function() {
    Deps.autorun(function() {
        var hovered = Session.get('hoveroverPercent')
        var sortBy = Session.get('distributionName');
        var conf_flow = Template.flow.configure;
        var dataProcessor_matrix = Template.matrix.dataProcessor;

        if (!conf_flow.sankeyData) return;

        var targetNode = conf_flow.sankeyData.nodes.filter(d => d.name === hovered.name)[0]
        targetNode.trees.sort((a, b) => {
            if (sortBy === 'population')
                return a.pattern.length - b.pattern.length;
            else if (sortBy === 'lean')
                return b.lean - a.lean;
            else return a.count - b.count;
        })

        var idx = Math.floor(targetNode.people.length * hovered.percent)

        var treePattern = null;
        var accum = 0;
        for (var i = 0; i < targetNode.trees.length; i++) {
            var t = targetNode.trees[i];
            if ((accum + t.count) >= idx) {
                treePattern = t.pattern;
                break;
            } else {
                accum += t.count;
            }
        }
        if(! treePattern) return;
        var conf = {
            height: 20+hovered.depth * 20,
            width: 60 + hovered.depth * 15,
            margin: 10,
        }
        conf.top = hovered.sankeyY < conf.height ? 40 : (hovered.sankeyY - conf.height - conf.margin);
        conf.left = Math.max(0, hovered.mouseX - conf.width / 2);

        d3.select("#sankeyDetailsDiv")
            .style("left", conf.left + "px")
            .style("top", conf.top + "px")
            .classed("hidden", false);

        var svg = d3.select('#sankeyDetails')
            .attr('width', conf.width)
            .attr('height', conf.height)

        svg.selectAll('*').remove();

        var treeObj = dataProcessor_matrix.seq2tree(treePattern);
        new d3.drawTree(svg, treeObj)
            .height(conf.height)
            .width(conf.width)
            .padding(0)
            .draw()

    })
};

// Template.tooltipTreemap.rendered = function() {
//     Deps.autorun(function() {

//     })
// };
