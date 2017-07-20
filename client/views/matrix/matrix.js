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
        $('#sizeSlider').noUiSlider({
            start: 30,
            range: {
                'min': 0,
                'max': 100,
            },
            step: 1,
        }, true)

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            conf_flow.malePeople_toUse = result.data;

            dataProcessor_flow.calGlobalData_toUse();

            HTTP.get(Meteor.absoluteUrl("/patterns.json"), function(err, result) {
                conf_flow.patterns = result.data;

                HTTP.get(Meteor.absoluteUrl("/sankeyData.json"), function(err, result) {

                    conf_flow.sankeyData = result.data;
                    Session.set('malePeopleObj_ready', new Date());
                });
            });
        });
    });

    var svg = d3.select('#matrixDiv')
        .style('height', ($('#analysisPanel').height() - 35) + 'px')
        .select('#matrixView')
    svg.append('g')
        .attr('class', 'rectCanvas')
        .attr('id', 'rectCanvas')
        .attr('transform', d3.translate(conf.outerMargin, conf.labelPart))

    //draw regression diagram when r collection changes
    Tracker.autorun(() => {

        var handler = Meteor.subscribe('r')
        if (handler.ready()) {

            var patterns = Coll.r.find().fetch();
            // if (_.isEmpty(conf_flow.involvedNodes)) return;
            var patterns_format = dataProcessor_matrix.reformatR(patterns);
            if (_.isEmpty(patterns_format)) return;

            new d3.drawMatrix(svg, patterns_format)
                .draw();

        }
    })


    var detailPanel = d3.select('#detailPanel')
        .style('height', ($('#sourceGroup').height() - 35) + 'px')

    var treemapCanvas = d3.select('#treemapSvg')
        .attr('height', '100%')
        .attr('width', '100%')
    var sourceConf = {
        width: $('#treemapSvg').width(),
        height: $('#treemapSvg').height(),
    }

    //draw treemap bars when click a sankey node
    Tracker.autorun(() => {
        Session.get('changeInvolvedNodes');
        if (_.isEmpty(conf_flow.involvedNodes)) return;
        if (!conf_flow.sankeyData) return;

        var selectedNode = conf_flow.involvedNodes;

        var x = d3.scale.ordinal()
            .domain(_.map(selectedNode, (d, i) => i))
            .rangeBands([0, sourceConf.width], .05, 0)

        treemapCanvas.selectAll('*').remove();
        treemapCanvas.selectAll('.treemapCanvas')
            .data(selectedNode).enter()
            .append('g')
            .attr('class', 'treemapCanvas')
            .attr('transform', (d, i) => d3.translate(x(i), 0))
            .each(function(d, i) {
                var subCanvas = d3.select(this);
                let padding = conf.treemap.padding;
                subCanvas.append('rect')
                    .attr('width', x.rangeBand())
                    .attr('class', 'legendRect')
                    .attr('height', sourceConf.height)
                    .attr('stroke', d3.googleColor(d.name))
                    .attr('stroke-width', padding * 2)

                let treemapG = subCanvas.append('g')
                    .attr('transform', d3.translate(padding, padding))

                new d3.drawTreemapBars(treemapG, d)
                    .width(x.rangeBand() - 2 * padding)
                    .height(sourceConf.height - 2 * padding)
                    .draw()

            })

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
    if (_.isEmpty(conf_flow.involvedNodes) || !conf_flow.malePeopleObj_toUse) return;

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
    'click #showhideME' (e) {
        var conf_matrix = Template.matrix.configure;
        conf_matrix.showME = !conf_matrix.showME;
        if (conf_matrix.showME) {
            d3.selectAll('.marginal').style('visibility', 'visible')
            d3.selectAll('.nonMarginal').style('visibility', 'hidden')
        } else {
            d3.selectAll('.nonMarginal').style('visibility', 'visible')
            d3.selectAll('.marginal').style('visibility', 'hidden')
        }
    },

});
