Template.matrix.rendered = function() {
    //-------------------------initialize data-------------------------
    var dataProcessor_flow = Template.flow.dataProcessor;
    var dataProcessor_matrix= Template.matrix.dataProcessor;
    var conf_flow = Template.flow.configure;

    Deps.autorun(function() {

        HTTP.get(Meteor.absoluteUrl("/malePeople.json"), function(err, result) {
            conf_flow.malePeople = result.data;

            conf_flow.malePeople_toUse = d3.deepCopyArr(conf_flow.malePeople);
            dataProcessor_flow.calGlobalData_toUse(false);

            Session.set('malePeopleObj_ready', new Date());
        });
    });

    Deps.autorun(() => {
        Session.get('malePeopleObj_ready');
        if(! conf_flow.malePeople_toUse) return;

        var canvas = d3.select('#matrixView');
        var roots= _.filter(conf_flow.malePeople_toUse, d=>d.depth>3);

        var matrixData=dataProcessor_matrix.getMatrixData(roots);
        var fakeTree=dataProcessor_matrix.generateFakeTree(3, 3)

        // new d3.drawMatrix(canvas, matrixData.children[0])
        //     .generation(3)
        //     .nSons(3)
        //     .draw();
        // new d3.drawMatrix(canvas, fakeTree)
        //     .generation(3)
        //     .nSons(3)
        //     .draw();

        console.log(matrixData.children[0])
    })

}


Template.matrix.helpers({

})

Template.matrix.events({


});
