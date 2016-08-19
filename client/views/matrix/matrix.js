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

        var handler = Meteor.subscribe('r')
        if (handler.ready()) {

            var patterns = Coll.r.find().fetch();
            if (! conf_flow.involvedNodes) return;
            var patterns_format = dataProcessor_matrix.reformatR(patterns);

            new d3.drawMatrix(svg, patterns_format)
                .patternPart(conf.patternPart)
                .draw();

        }
    })

    //draw group manipulation panel
    // Tracker.autorun(() => {
    //     var sourceTrees = Session.get('sourceTrees')
    //     if (!sourceTrees) return;

    //     var sourceCanvas = d3.select('#sourceSvg')
    //         .attr('width', $('#sourceGroup').width())
    //         .attr('height', $('#sourceGroup').height() * .9)
    //     new d3.drawPixelMatrix(sourceCanvas, sourceTrees)
    //         .width($('#sourceCanvas').width())
    //         .height($('#sourceCanvas').height())
    //         .draw();
    // })

    //initialize slider
    Tracker.autorun(() => {
        var targetDepthRange = [1, 7]
        var targetDepth = Session.get('targetDepth')
        if (!targetDepth) return;

        $('#targetDepthSlider')
            .noUiSlider({
                start: targetDepth,
                range: {
                    'min': targetDepthRange[0],
                    'max': targetDepthRange[1],
                },
                step: 1,
            }, true)
            .on('change', function(ev, val) {
                Session.set('targetDepth', Math.floor(val))
            })
    })

    var sourceConf = {
        width: $('#sourceGroup').width(),
        height: $('#sourceGroup').height() - 35,
    }
    var sourceCanvas = d3.select('#sourceSvg')
        .attr('width', sourceConf.width)
        .attr('height', sourceConf.height)
        .append('g')
        .attr('class', 'groupG')
        .attr('transform', d3.translate(conf.groupMargin.left, conf.groupMargin.top))

    Tracker.autorun(() => {
        var sourceTrees = Session.get('sourceTrees')
        if (!sourceTrees) return;
        var sourceCluster = sourceTrees[0].cluster;
        var sourceDepth = sourceTrees[0].depth;

        var targetDepth;
        var temp = Session.get('targetDepth')
        if (!temp || temp < sourceDepth + 1) {
            targetDepth = sourceDepth + 1;
            Session.set('targetDepth', targetDepth);
        } else {
            targetDepth = temp;
        }

        if (!targetDepth || !conf_flow.sankeyData) return;
        if (sourceCluster !== 0) return;

        var involvedNodes = conf_flow.sankeyData.nodes.filter(d => {
            if (d.depth === targetDepth) return true;
            else if (d.depth > sourceDepth && d.depth < targetDepth && d.cluster === 'cutoff') return true;
            else return false;
        })
        conf_flow.involvedNodes = involvedNodes;

        sourceCanvas.selectAll('*').remove();
        new d3.drawTreemapBars(sourceCanvas, involvedNodes)
            .width(sourceConf.width)
            .height(sourceConf.height)
            .draw()

    })

    // Tracker.autorun(() => {
    //     // Session.get('targetGroupsReady');
    //     if (!conf_flow.targetGroups || !conf_flow.malePeopleObj_toUse) return;

    //     var peoples = dataProcessor_matrix.formatRegressionData(conf_flow.targetGroups);
    //     console.log(peoples)
    //     Meteor.call('insertClusters', peoples, () => {
    //         console.log('insertdone')
    //         Meteor.call('regression')
    //     })

    // })

    Tracker.autorun(() => {
        var barName = Session.get('editBar')
        if (!conf_flow.involvedNodes || !barName) return;
        var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];
        $('.groupRadio').addClass('disabled').removeClass('active')
        if (node.button) {
            $('.groupRadio').removeClass('disabled')
            $(`#${node.button}`).addClass('active');
        } else {
            $('.groupRadio').removeClass('disabled')
        }

    })

    // Tracker.autorun(() => {
    //     var barName = Session.get('editBar')
    //     if (!conf_flow.involvedNodes || !barName) return;
    //     var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];

    //     var groupMethod = Session.get('groupMethod')

    // })

    Tracker.autorun(() => {
        var groupMethod=Session.get('groupMethod')
        var barName = Session.get('editBar')
        if (!conf_flow.involvedNodes || !barName) return;
        var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];
        node.draw='no';

        if (!node.button) return;

        var subgroups = dataProcessor_matrix.divideGroup(node, groupMethod);
        conf_flow.involvedNodes.push(...subgroups)

        sourceCanvas.selectAll('*').remove();
        new d3.drawTreemapBars(sourceCanvas, conf_flow.involvedNodes)
            .width(sourceConf.width)
            .height(sourceConf.height)
            .draw()

    })


}




Template.matrix.helpers({
    'targetDepth' () {
        return Math.floor(Session.get('targetDepth'));
    }

})

function assignButton(name) {
    var conf_flow = Template.flow.configure;
    var barName = Session.get('editBar')
    if (!barName) return;
    var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];
    node.button = name;
}

Template.matrix.events({
    'click #groupByInc' (e) {
        Session.set('groupMethod', 'inclination');
        assignButton('groupByInc')
    },
    'click #groupByFreq' (e) {
        Session.set('groupMethod', 'frequency');
        assignButton('groupByFreq')
    },
    'click #groupByVol' (e) {
        Session.set('groupMethod', 'volume');
        assignButton('groupByVol')
    },
    'click #runGrouping' (e) {
        var conf_flow = Template.flow.configure;
        var dataProcessor_matrix = Template.matrix.dataProcessor;
        if (!conf_flow.involvedNodes || !conf_flow.malePeopleObj_toUse) return;

        var peoples = dataProcessor_matrix.formatRegressionData(conf_flow.involvedNodes);
        Meteor.call('insertClusters', peoples, () => {
            console.log('inserted')
            Meteor.call('regression')
        })
    },

});

Meteor.startup(() => {
    Session.setDefault('targetDepth', 1)
    Session.setDefault('editBar', null)
    Session.setDefault('groupMethod', null)
})
