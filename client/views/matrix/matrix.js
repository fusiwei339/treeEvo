Template.matrix.rendered = function() {
    //-------------------------initialize data-------------------------
    var dataProcessor_flow = Template.flow.dataProcessor;
    var dataProcessor_matrix = Template.matrix.dataProcessor;
    var conf_flow = Template.flow.configure;
    var conf = Template.matrix.configure;
    var conf_option = Template.option.configure;
    $('#changeTargetDepth').selectpicker({
        width: 50,
    })

    //initialize data
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

    //draw regression diagram when r collection changes
    Tracker.autorun(() => {

        var handler = Meteor.subscribe('r')
        if (handler.ready()) {

            var patterns = Coll.r.find().fetch();
            if (!conf_flow.involvedNodes) return;
            var patterns_format = dataProcessor_matrix.reformatR(patterns);
            if (_.isEmpty(patterns_format)) return;

            new d3.drawMatrix(svg, patterns_format)
                .patternPart(conf.patternPart)
                .draw();

        }
    })


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
        height: $('#sourceGroup').height() - 40,
    }
    var detailPanel = d3.select('#detailPanel')
        .style('width', sourceConf.width+'px')
        .style('height', sourceConf.height+'px')

    var treemapCanvas = d3.select('#treemapSvg')
        .attr('height', '100%')

    var structureCanvas = d3.select('#structureDiv')
        .style('height', '100%')
        .select('#structureSvg')
        .attr('class', 'groupG')
        .attr('width', '100%')

    //draw treemap bars when click a sankey node
    Tracker.autorun(() => {
        var selectedNodeName= Session.get('selectedNode')
        if (!selectedNodeName|| !conf_flow.sankeyData) return;
        var selectedNode = conf_flow.sankeyData.nodes.filter(d => d.name===selectedNodeName)

        conf_flow.sourceCluster = selectedNode[0].cluster;
        conf_flow.sourceDepth = selectedNode[0].depth;

        treemapCanvas.selectAll('*').remove();
        new d3.drawTreemapBars(treemapCanvas, selectedNode[0])
            .width(sourceConf.width / 2)
            .height(sourceConf.height)
            .draw()

    })

    //when brush on the treemap bar
    Tracker.autorun(()=>{
        Session.get('selectedRects')
        if(! conf.selectedRects) return;

        var nRows=Math.ceil(conf.selectedRects.length/8);
        var rowHeight=conf_option.sankey.nodeWidth+(conf_flow.sourceDepth-1)*10;
        structureCanvas.selectAll('*').remove();

        structureCanvas.attr('height', nRows*rowHeight);
        new d3.drawBrushedPatterns(structureCanvas, conf.selectedRects)
            .width($('#structureDiv').width())
            .height(nRows*rowHeight)
            .patternHeight(rowHeight)
            .draw()
    })


    // //when click a treemap bar
    // Tracker.autorun(() => {
    //     var barName = Session.get('editBar')
    //     if (!conf_flow.involvedNodes || !barName) return;
    //     var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];
    //     $('.groupRadio').addClass('disabled').removeClass('active')
    //     if (node.button) {
    //         $('.groupRadio').removeClass('disabled')
    //         $(`#${node.button}`).addClass('active');
    //     } else {
    //         $('.groupRadio').removeClass('disabled')
    //     }

    // })

    //when click grouping method
    Tracker.autorun(() => {
        var groupMethod = Session.get('groupMethod')
        var barName = Session.get('editBar')
        if (!conf_flow.involvedNodes || !barName) return;
        var node = _.filter(conf_flow.involvedNodes, node => node.name === barName)[0];
        node.draw = 'no';

        if (!node.button) return;

        var subgroups = dataProcessor_matrix.divideGroup(node, groupMethod);
        conf_flow.involvedNodes.push(...subgroups)

        sourceCanvas.selectAll('*').remove();
        new d3.drawTreemapBars(sourceCanvas, conf_flow.involvedNodes)
            .width(sourceConf.width)
            .height(sourceConf.height)
            .draw()

    })

    //add or remove attrs
    Tracker.autorun(() => {
        Session.get('changeAttrs')
        run();
    })


}

function run() {
    var conf_flow = Template.flow.configure;
    var dataProcessor_matrix = Template.matrix.dataProcessor;
    var attrs = conf_flow.attrs;
    if (!conf_flow.involvedNodes || !conf_flow.malePeopleObj_toUse) return;

    var peoples = dataProcessor_matrix.formatRegressionData(conf_flow.involvedNodes, conf_flow.attrs);
    Meteor.call('insertClusters', peoples, () => {
        console.log('inserted')
        Meteor.call('regression', attrs)
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

function clickAttrButton(e) {
    var conf_flow = Template.flow.configure;
    var attrs = conf_flow.attrs;
    var str = e.currentTarget.id;
    if ($(e.currentTarget).hasClass('active')) {
        attrs.remByVal(str);
    } else {
        if (attrs.indexOf('str') === -1)
            attrs.push(str)
    }

    if (attrs.length > 1) {
        conf_flow.attrs = attrs;
        Session.set('changeAttrs', new Date())
    }
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
    'click #clearGroup' (e) {
        var newArr = []
        var conf_flow = Template.flow.configure;
        _.each(conf_flow.sankeyData.nodes, node => {
            if (node.cluster) {
                node.draw = null;
                node.button = null;
                newArr.push(node)
            }
        })
        conf_flow.involvedNodes = newArr;
        Session.set('groupMethod', null);
        Session.set('editBar', null);
        Session.set('redraw', new Date())
    },
    'click #runGrouping' (e) {
        run();
    },
    'click #f_bir_age' (e) {
        clickAttrButton(e);
    },
    'click #l_bir_age' (e) {
        clickAttrButton(e);
    },
    'click #lastage' (e) {
        clickAttrButton(e);
    },
    'click #sonCountFix' (e) {
        clickAttrButton(e);
    },
    'click #POSITION' (e) {
        clickAttrButton(e);
    },

});

Meteor.startup(() => {
    Session.setDefault('targetDepth', 1)
    Session.setDefault('editBar', null)
    Session.setDefault('groupMethod', null)
})
