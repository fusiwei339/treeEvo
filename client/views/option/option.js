Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor_option = Template.option.dataProcessor;
    var dataProcessor_flow = Template.flow.dataProcessor;

    //init attr list
    var attrList = Template.option.configure.attributeList;
    $('select[multiple]').multipleSelect('setSelects', attrList);
    Session.set('showAttrs', attrList)

    //init structure list
    Session.set('showStructures', [1, 2, 3, 4, 5])

    Deps.autorun(() => {
        Session.get('malePeopleObj_ready')
        if (!flowConf.sankeyData) return;

        var base = $('#attrListContainer')
        $('#structureContainer').css('height', 900)
        $('#structureSvg').css('height', 900)

        var graph = flowConf.sankeyData;

        var svg = d3.select('#structureSvg');
        svg.selectAll('*').remove();
        var flowCanvas = svg.append('g')
            .attr('transform', d3.translate(conf.sankey.margin, conf.sankey.margin))

        conf.sankey.svgWidth = $('#structureSvg').width()
        conf.sankey.svgHeight = $('#structureSvg').height()

        var scaleMethod = 'scaleBySqrt';

        var sankeyLayout = d3.sankey()
            .nodeWidth(conf.sankey.nodeWidth)
            .scaleFunc(dataProcessor_flow.getScaleFunc(scaleMethod))
            .nodePadding(conf.sankey.padding)
            .size([conf.sankey.svgHeight- conf.sankey.margin * 2, conf.sankey.svgWidth- conf.sankey.margin * 2])
            .nodes(graph.nodes)
            .links(graph.edges)
            .layout();

        var sankeyDiagram = new d3.drawSankey(flowCanvas, graph)
            .xOffset(0)
            .draw()
        console.log(graph)

    })

}


Template.option.helpers({
    'attributeList': function() {
        return Session.get('showAttrs');
    },
    'structureList': function() {
        return Session.get('showStructures');
    },
    'selectSettings': function() {
        return {
            placeholder: "Select attributes of interest",
            filter: true,
            multiple: false,
            keepOpen: false,
            onClose: function() {
                var attrs = $('select[multiple]').multipleSelect('getSelects');
                Session.set('showAttrs', attrs);
            },
        };
    },
    'selectOptions': function() {
        var list = Template.option.configure.attributeList;
        return _.map(list, function(d) {
            return {
                label: d,
                value: d,
            }
        })
    },
    'filter': function() {
        var obj = Session.get('filterMalePeople');
        return JSON.stringify(obj);
    },
    'clusters': function() {
        Session.get('clusterChanged');
        var clusters = Session.get('clusterMalePeople');
        var temp = clusters.sort(function(a, b) {
                return +a.order - (+b.order);
            })
            // console.log(temp)
        return temp;
    },
    'clusterChanged': function() {
        Session.get('clusterChanged');
        return true;
    },
    'stringify': function(obj) {
        return JSON.stringify(obj);
    },
    'getColor': function(order) {
        var colorArr = Template.option.configure.clusterColors;
        return colorArr[order];
    },

})

Template.option.events({
    'click #filterBtn': function() {
        var dataProcessor = Template.option.dataProcessor;
        var filter = Template.option.configure.filter;
        var query = dataProcessor.processSelection(filter);
        Template.option.configure.filter = {};
        Session.set('filterMalePeople', query);
    },
    'click #clearBtn': function() {
        var conf = Template.option.configure;
        conf.filter = {};
        conf.clusters = [{ description: 'all', order: 0 }];
        Session.set('filterMalePeople', {});
        Session.set('nodeSelected', null);
        Session.set('clusterMalePeople', [{ description: 'all', order: 0 }]);
        Session.set('clearBtn', new Date());
    },
    'click #clusterBtn': function() {
        var dataProcessor = Template.clusterWindow.dataProcessor;
        // var filter = Template.option.configure.filter;
        // var cluster = dataProcessor.processSelection(filter);

        // var clusters = Template.option.configure.clusters;
        // clusters.push({
        //     order: clusters.length,
        //     description: cluster,
        // });
        // clusters[0].description = 'others';
        // Template.option.configure.filter = {};
        // Session.set('clusterMalePeople', clusters);

        var items = dataProcessor.getClusters(Template.optionItem.configure.clusterRange);
        var clusters = dataProcessor.getClusterData(items);
        Template.option.configure.clusters = clusters;
        Meteor.call('insertClusters', clusters)
        Meteor.call('gspan')

        // $('#clusterModal').modal('show');

        Session.set('clusterBtn', new Date());
    },

});
