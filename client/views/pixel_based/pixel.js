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
    var featureCanvas = svg.append('g')
        .attr('class', 'flowCanvas')
        .attr('transform', d3.translate(0, conf.margin + svgHeight / 2))

    //-------------------------initialize data-------------------------
    Deps.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            var malePeopleObj = {};
            _.each(result.data, function(male) {
                malePeopleObj[male.personid] = male;
            });
            conf.malePeopleObj = malePeopleObj;
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
            Session.set('sankeyNodesReady', new Date());

            var sankeyDiagram = new d3.drawSankey(flowCanvas, graph, sankey)
            sankeyDiagram.draw();

        }
    })

    Deps.autorun(function() {

        Session.get('sankeyNodesReady');
        var data = conf.sankeyNodes;
        if(!data)return;

        var nodeSelection = featureCanvas.selectAll(".node")
            .data(data)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .each(function(d, i){
            	var statCanvas=d3.select(this);
            	var errorBar=new d3.drawErrBar(statCanvas, d);
            	errorBar.draw();	
            })
            .append("rect")
            .attr('class', 'featureRect')
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", 120)

    })

    //-------------------------hover over a bar-------------------------
    Deps.autorun(function() {
        var node = Session.get('nodeHovered');
        if (!node) return;
        var conf = Template.lineage.configure;
        if (!conf.malePeopleObj) return;

        var people = [];
        _.each(node.man, function(man) {
            people.push(conf.malePeopleObj['' + man]);
        })
        console.log(people)
    })

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
