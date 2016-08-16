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
        if (!conf_flow.malePeopleObj_toUse || ! conf_flow.sankeyData) return;

        var handler = Meteor.subscribe('r')
        if (handler.ready()) {

            var patterns = Coll.r.find().fetch();
            var patterns_format=dataProcessor_matrix.reformatR(patterns);

            if(_.isEmpty(patterns_format)) return;
            new d3.drawMatrix(svg, patterns_format)
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

        conf_flow.targetGroups=involvedNodes;
        Session.set('targetGroupsReady', new Date());

        var targetConf={
            width:$('#targetGroup').width(),
            height:$('#targetGroup').height() * .9
        }
        var targetCanvas = d3.select('#targetSvg')
            .attr('width', targetConf.width)
            .attr('height', targetConf.height)

        new d3.drawBars(targetCanvas, involvedNodes)
            .width(targetConf.width)
            .height(targetConf.height)
            .draw()


    })

    Tracker.autorun(()=>{
        Session.get('targetGroupsReady');
        if(! conf_flow.targetGroups || ! conf_flow.malePeopleObj_toUse) return;

        var peoples=dataProcessor_matrix.formatRegressionData(conf_flow.targetGroups);
        console.log(peoples)
        Meteor.call('insertClusters', peoples, ()=>{
            console.log('insertdone')
            Meteor.call('regression')
        })

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
