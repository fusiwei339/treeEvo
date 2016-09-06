Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor_option = Template.option.dataProcessor;
    var dataProcessor_flow = Template.flow.dataProcessor;

    //init attr list
    // var attrList = Template.option.configure.attributeList;
    // $('select[multiple]').multipleSelect('setSelects', attrList);
    // Session.set('showAttrs', attrList)


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
    Deps.autorun(()=>{
        Session.get('startSplit')
        console.log('startSplit')

        var selectedNodeName = Session.get('selectedNode')
        var conf_flow = Template.flow.configure;
        if (!selectedNodeName || !conf_flow.sankeyData) return;
        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name === selectedNodeName)
    })

}


Template.option.helpers({
    // 'attributeList': function() {
    //     return Session.get('showAttrs');
    // },
    // 'structureList': function() {
    //     return Session.get('showStructures');
    // },
    // 'selectSettings': function() {
    //     return {
    //         placeholder: "Select attributes of interest",
    //         filter: true,
    //         multiple: false,
    //         keepOpen: false,
    //         onClose: function() {
    //             var attrs = $('select[multiple]').multipleSelect('getSelects');
    //             Session.set('showAttrs', attrs);
    //         },
    //     };
    // },
    // 'selectOptions': function() {
    //     var list = Template.option.configure.attributeList;
    //     return _.map(list, function(d) {
    //         return {
    //             label: d,
    //             value: d,
    //         }
    //     })
    // },
    // 'filter': function() {
    //     var obj = Session.get('filterMalePeople');
    //     return JSON.stringify(obj);
    // },
    // 'clusters': function() {
    //     Session.get('clusterChanged');
    //     var clusters = Session.get('clusterMalePeople');
    //     var temp = clusters.sort(function(a, b) {
    //         return +a.order - (+b.order);
    //     })
    //     return temp;
    // },
    // 'clusterChanged': function() {
    //     Session.get('clusterChanged');
    //     return true;
    // },
    // 'stringify': function(obj) {
    //     return JSON.stringify(obj);
    // },
    // 'getColor': function(order) {
    //     var colorArr = Template.option.configure.clusterColors;
    //     return colorArr[order];
    // },

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
        if (!conf_flow.involvedNodes || !conf_flow.malePeopleObj_toUse) return;

        var peoples = dataProcessor_matrix.formatRegressionData(conf_flow.involvedNodes, conf_flow.attrs);
        Meteor.call('insertClusters', peoples, () => {
            console.log('inserted')
            Meteor.call('regression', attrs)
        })
    },

    'click #sortByInc': function() {
        Session.set('distributionName', 'lean')
        Session.set('redraw', new Date())
    },
    'click #sortByFreq': function() {
        Session.set('distributionName', 'count')
        Session.set('redraw', new Date())
    },
    'click #sortByPop': function() {
        Session.set('distributionName', 'population')
        Session.set('redraw', new Date())
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
