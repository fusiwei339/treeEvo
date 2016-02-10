var names = ['sankeyNodes', 'sankeyEdges'];
var names=[];

for (var i = 0; i < names.length; i++) {
    var name = names[i];
    // Coll[name].remove({});

    if (Coll[name].find({}).count() === 0) {
        var text = Assets.getText(name + '.json');

        var data = JSON.parse(text);
        console.log(name)

        if (_.isArray(data)) {
            data.forEach(function(item, index, array) {
                Coll[name].insert(item);
            })
        } else {
            Coll[name].insert(data);
        }
    }
}
