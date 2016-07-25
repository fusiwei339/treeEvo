Template.matrix.rendered = function() {
    //-------------------------initialize data-------------------------
    var dataProcessor_flow = Template.flow.dataProcessor;
    var dataProcessor_matrix = Template.matrix.dataProcessor;
    var conf_flow = Template.flow.configure;
    var conf = Template.matrix.configure;

    Tracker.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            conf_flow.malePeople = result.data;

            conf_flow.malePeople_toUse = d3.deepCopyArr(conf_flow.malePeople);
            dataProcessor_flow.calGlobalData_toUse(false);

            Session.set('malePeopleObj_ready', new Date());
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
        .attr('transform', d3.translate(0, conf.labelPart))

    // Tracker.autorun(() => {
    //     // dataProcessor_matrix.getFreq([2, 1, 4, 3, 5, 35, 2, 11, 1, 1])

    //     var handler = Meteor.subscribe('test');
    //     if (handler.ready()) {
    //         var trees = Coll.test.find().fetch();
    //         var treeGroups = d3.nest()
    //             .key(d => d.clusterRange)
    //             .entries(trees)

    //         _.each(treeGroups, d => {
    //             d.values = d.values.sort((a, b) => b.freq - a.freq)
    //             d.values = d.values.slice(0, 15);
    //         })

    //         var data = []
    //         _.each(treeGroups, group => {
    //             data.push(...group.values)
    //         })

    //         new d3.drawMatrix(svg, data)
    //             .patternPart(conf.patternPart)
    //             .draw();
    //     }
    // })

    Tracker.autorun(() => {
        Session.get('malePeopleObj_ready', new Date());
        if (!conf_flow.malePeopleObj_toUse) return;

        var handler = Meteor.subscribe('freqPatterns')
        if (handler.ready()) {

            var patterns = Coll.freqPatterns.find().fetch().sort((a, b) => {
                if (a.depth === b.depth) {
                    return a.pattern - b.pattern;
                } else {
                    return a.depth - b.depth;
                }
            }).slice(0, 15);

            var data = dataProcessor_matrix.getMatrixData_attr(conf.attrs, patterns);
            console.log(data)

            new d3.drawMatrix(svg, data)
                .patternPart(conf.patternPart)
                .draw();

        }
    })

}


Template.matrix.helpers({

})

Template.matrix.events({


});
