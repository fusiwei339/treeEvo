Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor_option = Template.option.dataProcessor;
    var dataProcessor_flow = Template.flow.dataProcessor;

    var svg = d3.select('#structureSvg');
    var flowCanvas = svg.append('g')
        .attr('transform', d3.translate(conf.sankey.margin, conf.sankey.margin))
        .attr('id', 'flowCanvas')

    Deps.autorun(() => {
        Session.get('redraw')
        Session.get('malePeopleObj_ready')
        if (!flowConf.sankeyData) return;

        var base = $('#attrListContainer')
        $('#structureSvg').css('height', 900)

        var graph = flowConf.sankeyData;
        var nodes = graph.nodes.filter(d => d.show).sort((a, b) => a.depth - b.depth)
            // var edges = graph.edges
        var edges = dataProcessor_option.sankeyEdges(nodes);
        var trimedGraph = { nodes, edges }

        conf.sankey.svgWidth = $('#structureSvg').width()
        conf.sankey.svgHeight = $('#structureSvg').height()

        var scaleMethod = Session.get('scaleBar');

        var sankeyLayout = d3.sankey()
            .nodeWidth(conf.sankey.nodeWidth)
            .scaleFunc(dataProcessor_flow.getScaleFunc(scaleMethod))
            .nodePadding(conf.sankey.padding)
            .size([conf.sankey.svgHeight - conf.sankey.margin * 2, conf.sankey.svgWidth - conf.sankey.margin * 2])
            .nodes(nodes)
            .links(edges)
            .layout();

        _.each(graph.nodes, node => {
            node.trees.sort((a, b) => {
                if (a.count === b.count) {
                    return a.pattern.length - b.pattern.length;
                }
                return b.count - a.count
            })
            _.each(node.trees, tree => {
                tree.pattern = tree.pattern.sort();
            })
        })
        new d3.drawSankey(flowCanvas, trimedGraph)
            .depthLimit(7)
            .classStr('sankey')
            .draw()

    })

    Deps.autorun(() => {
        Session.get('malePeopleObj_ready')
        var selectedPattern = Session.get('selectedPattern');
        if (!flowConf.sankeyData || !selectedPattern) return;

        var flowCanvas = d3.select('#flowCanvas')

        var currentNodeName = `depth${selectedPattern.depth}cluster${selectedPattern.cluster}`
        _.each(flowConf.sankeyData.edges, edge => {
            if (edge.source.name === currentNodeName) {
                var target = edge.target;
                var parentPattern = selectedPattern.pattern.join(',');
                target.trees.sort((a, b) => {
                    if (a.parent.join(',') === parentPattern && b.parent.join(',') !== parentPattern) {
                        return -1;
                    } else if (a.parent.join(',') !== parentPattern && b.parent.join(',') === parentPattern) {
                        return 1;
                    } else return b.count - a.count;
                })
            }
        });

        new d3.drawSankey(flowCanvas, flowConf.sankeyData).draw()

    })

    //when press split button
    Deps.autorun(() => {
        Session.get('startSplit')

        var selectedNodeName = Session.get('selectedNode')
        var sortBy=Session.get('distributionName');
        var conf_flow = Template.flow.configure;
        var percentArr = conf_flow.percentArr;
        if (_.isEmpty(percentArr) || !selectedNodeName || !conf_flow.sankeyData) return;

        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name === selectedNodeName)

    })

}


Template.option.helpers({


})

Template.option.events({
    'click #scaleByUni': function() {
        Session.set('scaleBar', 'scaleByUni');
    },
    'click #scaleByDefault': function() {
        Session.set('scaleBar', 'scaleByDefault');
    },

    'click #runGrouping' (e) {
        var conf_flow = Template.flow.configure;
        var dataProcessor_matrix = Template.matrix.dataProcessor;
        var attrs = conf_flow.attrs;
        if (_.isEmpty(conf_flow.involvedNodes) || !conf_flow.malePeopleObj_toUse) return;

        var peoples = dataProcessor_matrix.formatRegressionData(conf_flow.involvedNodes, attrs);
        Meteor.call('insertClusters', peoples, () => {
            console.log('inserted')
            Meteor.call('regression', attrs)
        })
    },

    'click #sortByInc': function() {
        Session.set('distributionName', 'lean')
    },
    'click #sortByFreq': function() {
        Session.set('distributionName', 'count')
    },
    'click #sortByPop': function() {
        Session.set('distributionName', 'population')
    },

    'click #mergebtn': function() {},
    'click #splitAttrBtn': function() {
        Session.set('startSplit', new Date())
    },
    'click #splitContBtn': function() {
        var selectedNodeName = Session.get('selectedNode')
        var conf_flow = Template.flow.configure;
        if (!selectedNodeName || !conf_flow.sankeyData) return;
        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name === selectedNodeName)

        var sourceDepth = selectedNode[0].depth;
        _.each(conf_flow.sankeyData.nodes, node => {
            if (node.depth === sourceDepth) {
                if (node.cluster === 'cutoff' || node.cluster === 'continue')
                    node.show = true;
                else node.show = false;
            }
        })
        Session.set('redraw', new Date());
    },

    'click #clear_moving': function() {
        d3.selectAll('.slice').remove();
    },

});
