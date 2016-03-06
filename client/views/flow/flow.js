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
        .attr('class', 'flowCanvas')
        .attr('transform', d3.translate(0, conf.margin + svgHeight * conf.flowPart))

    //-------------------------initialize data-------------------------
    Deps.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            var malePeopleObj_ori = {};
            _.each(result.data, function(male) {
                malePeopleObj_ori[male.personid] = male;
            });
            conf.malePeopleObj_father = _.groupBy(result.data, function(male) {
                return male.fatherid;
            })
            conf.malePeopleObj_ori = malePeopleObj_ori;
            conf.malePeople=result.data;
            Session.set('malePeopleObj_ready', new Date());
        });
    })

    //-------------------------draw flow initially-------------------------
    Deps.autorun(function() {
        var scaleMethod = Session.get('scaleBar');
        $('#' + scaleMethod).addClass('active');
        Session.get('malePeopleObj_ready');

        if (!conf.malePeopleObj_ori ||
            !conf.malePeople
            ) return;


        var dataProcessor = Template.flow.dataProcessor;
        var graph=dataProcessor.getSankeyGraph_allPeople();

        dataProcessor.calBasicInfo(graph.nodes, graph.links);

        var sankey = d3.sankey()
            .nodeWidth(conf.nodeWidth)
            .scaleFunc(dataProcessor.getScaleFunc(scaleMethod))
            .nodePadding(conf.nodePadding)
            .size([conf.svgWidth - conf.margin, conf.svgHeight * conf.flowPart - conf.margin])
            .nodes(graph.nodes)
            .links(graph.links)
            .layout();

        conf.sankeyNodes = sankey.nodes();
        conf.sankeyEdges = sankey.links();

        if (!conf.color) {
            var colorDomain = _.uniq(_.map(graph.nodes, function(node) {
                return node.vertiSort;
            })).sort();
            var color = d3.scale.ordinal()
                .domain(colorDomain);
            conf.color = color;
        }
        var colorRange = ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#fddaec'];
        conf.color.range(colorRange);

        var sankeyDiagram = new d3.drawSankey(flowCanvas, graph)
            .xOffset(0)
            .color(conf.color)
            .clickFunc(function(d) {
                Session.set('nodeSelected', {
                    generation: d.generation,
                    cluster: d.cluster,
                    man: d.man,
                });
            })
            .draw()

        Session.set('sankeyNodesReady', new Date());

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
        var scaleMethod = Session.get('scaleBar');

        var conf = Template.flow.configure;
        var node = Session.get('nodeSelected');
        var dataProcessor = Template.flow.dataProcessor;

        if (!conf.malePeopleObj_ori ||
            !conf.malePeopleObj_father ||
            !node ||
            !conf.max_generation ||
            !conf.color) return;

        var highlightSankeyGraph = dataProcessor.getHighlightSankeyGraph(node);

        var colorRange = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#f781bf'];
        conf.color.range(colorRange);
        // .range(['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928'])

        var sankeyDiagram = new d3.drawSankey(highlightFlowCanvas, highlightSankeyGraph)
            .xOffset(0)
            .classStr("highlight")
            .color(conf.color)
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
