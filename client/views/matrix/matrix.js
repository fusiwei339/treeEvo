Template.matrix.rendered = function() {
    //-------------------------initialize data-------------------------
    var dataProcessor_flow = Template.flow.dataProcessor;
    var dataProcessor_matrix = Template.matrix.dataProcessor;
    var conf_flow = Template.flow.configure;
    var conf = Template.matrix.configure;
    $('#changeTargetDepth').selectpicker({
        width: 50,
    })
    // $('#changeTargetDepth').on(, {
    //     width: 50,
    // })

    Tracker.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            conf_flow.malePeople = result.data;

            conf_flow.malePeople_toUse = d3.deepCopyArr(conf_flow.malePeople);
            dataProcessor_flow.calGlobalData_toUse(false);

            HTTP.get(Meteor.absoluteUrl("/patterns.json"), function(err, result) {
                conf_flow.patterns = result.data;
                conf_flow.patternsObj = _.groupBy(conf_flow.patterns, p => p.depth);

                HTTP.get(Meteor.absoluteUrl("/sankeyData.json"), function(err, result) {

                    conf_flow.sankeyData = result.data;
                    Session.set('malePeopleObj_ready', new Date());
                });
            });
        });
    });

    var svg = d3.select('#matrixView');
    svg.append('g')
        .attr('class', 'rectCanvas')
        .attr('id', 'rectCanvas')
        .attr('transform', d3.translate(conf.patternPart, conf.labelPart))
    svg.append('g')
        .attr('class', 'patternCanvas')
        .attr('id', 'patternCanvas')
        .attr('transform', d3.translate(5, conf.labelPart))

    //draw regression diagram
    Tracker.autorun(() => {
        Session.get('malePeopleObj_ready', new Date());
        if (!conf_flow.malePeopleObj_toUse) return;

        var handler = Meteor.subscribe('rPretty')
        if (handler.ready()) {

            var patterns = Coll.rPretty.find().fetch();

            new d3.drawMatrix(svg, patterns)
                .patternPart(conf.patternPart)
                .draw();

        }
    })

    //draw group manipulation panel
    Tracker.autorun(() => {
        var sourceTrees = Session.get('sourceTrees')
        if (!sourceTrees) return;

        var sourceCanvas = d3.select('#sourceCanvas')
            .attr('width', $('#sourceGroup').width())
            .attr('height', $('#sourceGroup').height() * .9)
        new d3.drawPixelMatrix(sourceCanvas, sourceTrees)
            .width($('#sourceCanvas').width())
            .height($('#sourceCanvas').height())
            .draw();
    })

    Tracker.autorun(()=>{
        var targetDepth=Session.get('targetDepth')
        var sourceTrees= Session.get('sourceTrees')
        if(!targetDepth || !conf_flow.sankeyData) return;
        var sourceCluster=sourceTrees[0].cluster;
        var sourceDepth=sourceTrees[0].depth;
        if(sourceCluster!==0) return;

        var involvedNodes=conf_flow.sankeyData.nodes.filter(d=>{
            if(d.depth===targetDepth) return true;
            else if(d.depth>sourceDepth && d.depth<targetDepth && d.cluster==='cutoff') return true;
            else return false;
        })

        var involvedTrees=[]
        _.each(involvedNodes, node=>involvedTrees.push(...node.trees))

        var targetCanvas = d3.select('#targetSvg')
            .attr('width', $('#targetGroup').width())
            .attr('height', $('#targetGroup').height() * .9)

        // new d3.


    })

}


Template.matrix.helpers({

})

Template.matrix.events({
    'change #changeTargetDepth' (e) {
        var target=e.currentTarget
        var targetDepth=target.options[target.selectedIndex].value;
        Session.set('targetDepth', +targetDepth);
    }

});
