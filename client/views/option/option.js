Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor_option = Template.option.dataProcessor;
    var dataProcessor_flow = Template.flow.dataProcessor;

    var svg = d3.select('#structureSvg');
    var flowCanvas = svg.append('g')
        .attr('transform', d3.translate(conf.sankey.margin, conf.sankey.margin))
        .attr('id', 'flowCanvas')

    //init draw sankey
    Deps.autorun(() => {
        Session.get('redraw')
        Session.get('malePeopleObj_ready')
        if (!flowConf.sankeyData) return;

        $('#structureSvg').css('height', 900)

        var graph = flowConf.sankeyData;
        var nodes = graph.nodes.filter(d => d.show).sort((a, b) => a.depth - b.depth)
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

        new d3.drawSankey(flowCanvas, trimedGraph)
            .depthLimit(7)
            .classStr('sankey')
            .draw()

    })

    //multi select sankey nodes
    Deps.autorun(()=>{
        Session.get('multipleNodes')
    })


    //when press split button
    Deps.autorun(() => {
        Session.get('startSplit')

        var selectedNodeName = Session.get('selectedNode')
        var sortBy = Session.get('distributionName');
        var conf_flow = Template.flow.configure;
        var percentArr = conf_flow.percentArr;
        if (_.isEmpty(percentArr) || !selectedNodeName || !conf_flow.sankeyData) return;

        //generate partitions
        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name === selectedNodeName)[0];
        selectedNode.trees.sort((a, b) => {
            if (sortBy === 'population')
                return a.pattern.length - b.pattern.length;
            else if (sortBy === 'lean')
                return b.lean - a.lean;
            else return a.count - b.count;
        })
        percentArr.unshift(0);
        percentArr.push(1);
        var accum = 0,
            idx = 0;
        var partitions = [],
            temp = [];

        function summaryPersonids(trees) {
            var ret = []
            _.each(trees, tree => ret.push(...tree.personids))
            return ret;
        }
        for (var i = 0, len = selectedNode.trees.length; i < len; i++) {
            var tree = selectedNode.trees[i];
            accum += tree.personids.length / selectedNode.people.length;
            if (i === selectedNode.trees.length - 1) {
                temp.push(tree);
                partitions.push({
                    trees: temp,
                    depth: temp[0].depth,
                    cluster: '' + accum,
                    idx: selectedNode.idx + accum,
                    show: true,
                    people: summaryPersonids(temp),
                    name: 'd' + temp[0].depth + 'c' + accum,
                    totalPeople: selectedNode.totalPeople,
                });
                temp = [];
                continue;
            }
            if (accum < percentArr[idx + 1]) {
                temp.push(tree);
            } else {
                if (_.isEmpty(temp)) continue;

                partitions.push({
                    trees: temp,
                    depth: temp[0].depth,
                    cluster: '' + accum,
                    idx: selectedNode.idx + accum,
                    show: true,
                    people: summaryPersonids(temp),
                    name: 'd' + temp[0].depth + 'c' + accum,
                    totalPeople: selectedNode.totalPeople,
                });
                temp = [];
                idx++;
                temp.push(tree);
            }
        }
        conf_flow.percentArr = [];

        //deal with sankeydata
        _.each(conf_flow.sankeyData.nodes, node => {
            if (node.name === selectedNode.name)
                node.show = false;
        })
        conf_flow.sankeyData.nodes.push(...partitions);
        Session.set('redraw', new Date());

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
            console.log(peoples)
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

    'click #mergebtn': function() {
        var selectedNodeName = Session.get('selectedNode')
        var conf_flow = Template.flow.configure;
        if (!selectedNodeName || !conf_flow.sankeyData) return;
        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name === selectedNodeName)

        var sourceDepth = selectedNode[0].depth;
        _.each(conf_flow.sankeyData.nodes, node => {
            if (node.depth === sourceDepth) {
                if (node.cluster === '0')
                    node.show = true;
                else node.show = false;
            }
        })
        Session.set('selectedNode', null);
        Session.set('redraw', new Date());
    },
    'click #splitAttrBtn': function() {
        d3.selectAll('.slice').remove();
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
        Session.set('selectedNode', null);
        Session.set('redraw', new Date());
    },

    'click #clear_moving': function() {
        d3.selectAll('.slice').remove();
        conf_flow.percentArr = [];
    },

});
