Template.lineage.rendered = function() {
    Deps.autorun(function() {
        //create canvas
        var dataProcessor = Template.lineage.dataProcessor;

        var svgWidth = $('#flowPanel').width();
        var svgHeight = $('#flowPanel').height();
        var svg = d3.select('#flowView')
            .attr('width', svgWidth)
            .attr('height', svgHeight)

        svg.selectAll('*').remove();
        var canvas = svg.append('g')
            .attr('class', 'flowCanvas')

        var nodeHandler = Meteor.subscribe('sankeyNodes');
        var edgeHandler = Meteor.subscribe('sankeyEdges');
        if (nodeHandler.ready() && edgeHandler.ready()) {
            var nodes = Coll.sankeyNodes.find().fetch();
            var edges = Coll.sankeyEdges.find().fetch();
            var graph = dataProcessor.getSankeyGraph(nodes, edges);
            var margin=5;

            var sankey = d3.sankey()
                .nodeWidth(16)
                .width(svgWidth)
                .height(svgHeight)
                .nodePadding(5)
                .size([svgWidth-margin, svgHeight-margin])
                .nodes(graph.nodes)
                .links(graph.links)
                .layout(10);

            var sankeyDiagram=new d3.drawSankey(canvas, graph, sankey)
            sankeyDiagram.draw();

        }
    })

}


Template.lineage.helpers({


})

Template.lineage.events({


});


Meteor.startup(function() {})
