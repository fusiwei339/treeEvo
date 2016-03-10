Template.flow.rendered = function() {
    var svgWidth = $('#flowPanel').width();
    var svgHeight = $('#flowPanel').height();
    var conf = Template.flow.configure;
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
        .attr('class', 'statCanvas')
        .attr('transform', d3.translate(0, conf.margin + svgHeight * conf.flowPart))

    //-------------------------initialize data-------------------------
    Deps.autorun(function() {

        var dataProcessor_option = Template.option.dataProcessor;
        var dataProcessor_flow = Template.flow.dataProcessor;

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            conf.malePeople = result.data;

            conf.malePeople_toUse = d3.deepCopyArr(conf.malePeople);
            dataProcessor_flow.calGlobalData_toUse(conf.malePeople_toUse, true);

            Session.set('malePeopleObj_ready', new Date());
        });
    })

    //prepare sankey diagram data
    Deps.autorun(function() {
        Session.get('malePeopleObj_ready');

        if (!conf.malePeopleObj_toUse ||
            !conf.malePeople_toUse
        ) return;


        var dataProcessor = Template.flow.dataProcessor;
        var graph = dataProcessor.getSankeyGraph_allPeople(conf.malePeople_toUse);

        dataProcessor.calBasicInfo(graph.nodes, graph.links);
        Session.set('sankeyGraph_toDraw', graph);

    })

    //-------------------------draw flow initially-------------------------
    Deps.autorun(function() {
        var scaleMethod = Session.get('scaleBar');
        $('#' + scaleMethod).addClass('active');
        var dataProcessor = Template.flow.dataProcessor;
        var graph = Session.get('sankeyGraph_toDraw');

        if (!conf.malePeopleObj_toUse ||
            !conf.malePeople_toUse ||
            !graph.nodes
        ) return;

        var sankey = d3.sankey()
            .nodeWidth(conf.nodeWidth)
            .scaleFunc(dataProcessor.getScaleFunc(scaleMethod))
            .nodePadding(conf.nodePadding)
            .size([conf.svgWidth - conf.margin, conf.svgHeight * conf.flowPart - conf.margin])
            .nodes(graph.nodes)
            .links(graph.links)
            .layout();

        var sankeyDiagram = new d3.drawSankey(flowCanvas, graph)
            .xOffset(0)
            .clickFunc(function(d) {
                Session.set('nodeSelected', {
                    generation: d.generation,
                    cluster: d.cluster,
                    man: d.man,
                });
            })
            .draw()

        conf.sankeyNodes = graph.nodes;
        conf.sankeyEdges = graph.links;

        Session.set('sankeyNodesReady', new Date());

    })

    //-------------------------draw stat diagrams-------------------------
    Deps.autorun(function() {

        Session.get('sankeyNodesReady');
        var data = conf.sankeyNodes;
        if (!data) return;

        featureCanvas.selectAll('g').remove();
        var canvas = featureCanvas.append('g')
            .attr('class', 'statG')

        var drawStat = new d3.drawStat(featureCanvas, data);
        drawStat.draw();

    })

    //-------------------------click a bar-------------------------
    Deps.autorun(function() {

        Session.get('malePeopleObj_ready');
        Session.get('sankeyNodesReady');
        var scaleMethod = Session.get('scaleBar');

        var conf = Template.flow.configure;
        var node = Session.get('nodeSelected');
        var dataProcessor = Template.flow.dataProcessor;

        if (!conf.malePeopleObj_toUse ||
            !conf.malePeopleObj_father_toUse ||
            !conf.max_generation ||
            !node) {
            highlightFlowCanvas.selectAll('*').remove();
            return;
        }

        var highlightSankeyGraph = dataProcessor.getHighlightSankeyGraph(node);

        var sankeyDiagram = new d3.drawSankey(highlightFlowCanvas, highlightSankeyGraph)
            .xOffset(0)
            .classStr("highlight")
            .draw();

    })

}


Template.flow.helpers({

})

Template.flow.events({
    'click #scaleBySqrt': function() {
        Session.set('scaleBar', 'scaleBySqrt');
    },
    'click #scaleByUni': function() {
        Session.set('scaleBar', 'scaleByUni');
    },
    'click #scaleByDefault': function() {
        Session.set('scaleBar', 'scaleByDefault');
    },

});
