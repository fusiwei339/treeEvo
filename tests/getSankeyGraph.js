db.malePeople.ensureIndex({
    cluster: 1
})
db.malePeople.ensureIndex({
    fatherid: 1
})
db.malePeople.ensureIndex({
    personid: 1,
    cluster: 1
})



//1st geneeration
// var nodes = [];
// var clusters = db.malePeople.distinct('cluster');
// _.each(clusters, function(cluster) {
//     var man = db.malePeople.distinct('personid', {
//         cluster: cluster
//     });
//     nodes.push({
//         man: man,
//         cluster: cluster,
//         generation: 1,
//     })
// })
// db.sankey.insert(nodes)

//2nd geneeration
var expandNodes = function(nodes, attr) {
    var arr = [];
    _.map(nodes, function(d) {
        arr = d[attr].reduce(function(coll, item) {
            coll.push(item);
            return coll;
        }, arr);
    })
    return arr;
}

for (var currentGen = 1; currentGen < 13; currentGen++) {

    // var currentGen = 1;
    //get fatherids
    var nodes = db.sankey.find({
        generation: currentGen
    }).toArray();
    var fatherids = _.uniq(expandNodes(nodes, 'man'));

    //get current peoples
    var allPeople = db.malePeople.find({
        fatherid: {
            $in: fatherids
        }
    }).toArray();
    print(allPeople.length)

    var clusters = d3.nest()
        .key(function(d) {
            return d.cluster;
        })
        .entries(allPeople)

    _.each(clusters, function(cluster) {
        db.sankey.insert({
            man: _.map(cluster.values, function(value) {
                return value.personid;
            }),
            cluster: cluster.key,
            generation: currentGen + 1,
        })
    })
}
