Template.lineage.rendered = function() {
    var svgWidth = $('#flowPanel').width();
    var svgHeight = $('#flowPanel').height();
    var conf = Template.lineage.configure;
    conf.svgWidth = svgWidth;
    conf.svgHeight = svgHeight;
    var svg = d3.select('#flowView')
        .attr('width', svgWidth)
        .attr('height', svgHeight)

    var flowCanvas = svg.append('g')
        .attr('class', 'flowCanvas')
        .attr('transform', d3.translate(0, conf.margin))
    var highlightFlowCanvas = svg.append('g')
        .attr('class', 'highlightFlowCanvas')
        .attr('transform', d3.translate(0, conf.margin))
    var featureCanvas = svg.append('g')
        .attr('class', 'flowCanvas')
        .attr('transform', d3.translate(0, conf.margin + svgHeight / 2))

    //-------------------------initialize data-------------------------
    Deps.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            var malePeopleObj_ori = {};
            var malePeopleObj_fatherson = {};
            _.each(result.data, function(male) {
                malePeopleObj_ori[male.personid] = male;
                malePeopleObj_fatherson['p' + male.personid + 'f' + male.fatherid] = male;
            });
            conf.malePeopleObj_father = _.groupBy(result.data, function(male) {
                return male.fatherid;
            })
            conf.malePeopleObj_ori = malePeopleObj_ori;
            conf.malePeopleObj_fatherson = malePeopleObj_fatherson;
            Session.set('malePeopleObj_ready', new Date());
        });
    })

    //-------------------------draw flow initially-------------------------
    Deps.autorun(function() {
        //create canvas
        var scaleMethod = Session.get('scaleBar');
        var dataProcessor = Template.lineage.dataProcessor;

        var nodeHandler = Meteor.subscribe('sankeyNodes');
        var edgeHandler = Meteor.subscribe('sankeyEdges');
        if (nodeHandler.ready() && edgeHandler.ready()) {

            var nodes = Coll.sankeyNodes.find().fetch();
            var edges = Coll.sankeyEdges.find().fetch();
            dataProcessor.calBasicInfo(nodes, edges);
            var graph = dataProcessor.getSankeyGraph(nodes, edges);

            var sankey = d3.sankey()
                .nodeWidth(conf.nodeWidth)
                .scaleFunc(dataProcessor.getScaleFunc(scaleMethod))
                .nodePadding(conf.nodePadding)
                .size([conf.svgWidth - conf.margin, conf.svgHeight / 2 - conf.margin])
                .nodes(graph.nodes)
                .links(graph.links)
                .layout();

            conf.sankeyNodes = sankey.nodes();
            conf.sankeyEdges = sankey.links();

            var colorDomain = _.uniq(_.map(graph.nodes, function(node) {
                return node.cluster;
            })).sort();
            var color = d3.scale.ordinal()
                .domain(colorDomain)
                .range(['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#e5d8bd', '#fddaec', '#f2f2f2'])
                // .range(['#a6cee3','#b2df8a','#fb9a99','#fdbf6f','#cab2d6','#ffff99'])
            conf.colorScale = color;
            var sankeyDiagram = new d3.drawSankey(flowCanvas, graph)
                .xOffset(0)
                .color(color)
                .clickFunc(function(d) {
                    Session.set('nodeSelected', {
                        generation: d.generation,
                        cluster: d.cluster,
                        man: d.man,
                    });
                })
                .draw()

            Session.set('sankeyNodesReady', new Date());

        }
    })

    //-------------------------draw stat diagrams-------------------------
    Deps.autorun(function() {

        Session.get('sankeyNodesReady');
        var data = conf.sankeyNodes;
        if (!data) return;

        var drawStat = new d3.drawStat(featureCanvas, data);
        drawStat.draw();

    })

    //-------------------------click a bar-------------------------
    Deps.autorun(function() {

        Session.get('malePeopleObj_ready');
        Session.get('sankeyNodesReady');

        var conf = Template.lineage.configure;
        var node = Session.get('nodeSelected');
        var dataProcessor = Template.lineage.dataProcessor;

        if (!conf.malePeopleObj_ori ||
            !conf.malePeopleObj_father ||
            !node ||
            !conf.generations ||
            !conf.malePeopleObj_fatherson) return;

        var highlightSankeyGraph = dataProcessor.getHighlightSankeyGraph(node);

        var colorDomain = _.uniq(_.map(highlightSankeyGraph.nodes, function(node) {
            return node.cluster;
        })).sort();
        var color = d3.scale.ordinal()
            .domain(colorDomain)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf', '#999999'])
            // .range(['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928'])

        var sankeyDiagram = new d3.drawSankey(highlightFlowCanvas, highlightSankeyGraph)
            .xOffset(5)
            .classStr("highlight")
            .color(color)
            .draw();

    })

    //-------------------------hover over a bar-------------------------
    // Deps.autorun(function() {
    //     Session.get('malePeopleObj_ready');
    //     var node = Session.get('nodeHovered');
    //     var conf = Template.lineage.configure;

    //     if (!node) return;
    //     if (!conf.malePeopleObj) return;

    //     var people = [];
    //     _.each(node.man, function(man) {
    //         people.push(conf.malePeopleObj['' + man]);
    //     })
    //     console.log(people)
    // })

}


Template.lineage.helpers({


})

Template.lineage.events({
    'click #scaleBySqrt': function() {
        Session.set('scaleBar', 'sqrt');
    },
    'click #scaleByUni': function() {
        Session.set('scaleBar', 'uni');
    },
    'click #scaleByDefault': function() {
        Session.set('scaleBar', 'linear');
    },

});


Meteor.startup(function() {
    Session.set('scaleBar', 'uni');

})
