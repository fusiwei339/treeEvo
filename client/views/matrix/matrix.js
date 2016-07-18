Template.matrix.rendered = function() {
    //-------------------------initialize data-------------------------
    var dataProcessor_flow = Template.flow.dataProcessor;
    var dataProcessor_matrix = Template.matrix.dataProcessor;
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
        if (!conf_flow.malePeople_toUse) return;

        var canvas = d3.select('#matrixView');
        var roots = _.filter(conf_flow.malePeople_toUse, d => d.depth > 3);

        var matrixData = dataProcessor_matrix.getMatrixData(roots);
        var fakeTree = dataProcessor_matrix.generateFakeTree(3, 3)

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

    Deps.autorun(() => {
        function validateTree(seq) {
            var ret = { label: '0', children: [] };
            seq = seq.sort();
            var flag = true;
            if (seq[0] !== '0') return false;

            for (var i = 1; i < seq.length; i++) {
                var item = seq[i];
                var elems = item.split('g');
                elems.shift();
                flag = walk(elems, ret);
                if (flag) continue;
                else return false;
            }
            return ret;

            function walk(items, obj) {
                if (items.length < 1)
                    return true;

                var first = +items.shift();
                if (obj.children) {
                    if (obj.children.length === first) {
                        obj.children.push({
                            label: obj.label + 'g' + first,
                            children: [],
                        })
                        return walk(items, obj.children[first]);
                    } else if (obj.children.length < first) {
                        return false;
                    } else {
                        return walk(items, obj.children[first])
                    }
                }
                return false;
            }
        }

        var handler = Meteor.subscribe('test');
        // if (handler.ready()) {
        var data = Coll.test.find().fetch();
        var trees = [];
        _.each(data, d => {
            let temp = validateTree(d.path)
            if (temp) trees.push({
                clusterName: d.clusterName,
                clusterRange: d.clusterRange,
                tree: temp,
                freq: d.freq,
                str: d.path.join()
            })
        })

        var treeGroups = d3.nest()
            .key(d => d.clusterRange)
            .entries(trees)

        var canvas = d3.select('#matrixView');
        
            // }
    })

}


Template.matrix.helpers({

})

Template.matrix.events({


});
