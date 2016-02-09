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

// db.sankeyNodes.drop()
// db.sankeyEdges.drop()

// var initGen = 0,
//     maxGen = 11;
// //1st geneeration
// print('dealing with 1st geneeration')
// var nodes = [];
// var clusters = db.malePeople.distinct('cluster');
// _.each(clusters, function(cluster) {
//     var man = db.malePeople.distinct('personid', {
//         cluster: cluster
//     });
//     nodes.push({
//         man: man,
//         cluster: cluster,
//         generation: initGen,
//         name: 'gen' + initGen + 'cluster' + cluster,
//     })
// })
// db.sankeyNodes.insert(nodes)

// //2nd geneeration
// var expandNodes = function(nodes, attr) {
//     var arr = [];
//     _.map(nodes, function(d) {
//         arr = d[attr].reduce(function(coll, item) {
//             coll.push(item);
//             return coll;
//         }, arr);
//     })
//     return arr;
// }

// print('dealing with other geneerations')
// for (var currentGen = initGen; currentGen < maxGen; currentGen++) {

//     //get fatherids
//     var nodes = db.sankeyNodes.find({
//         generation: currentGen
//     }).toArray();
//     var fatherids = _.uniq(expandNodes(nodes, 'man'));

//     //get current peoples
//     var allPeople = db.malePeople.find({
//         fatherid: {
//             $in: fatherids
//         }
//     }).toArray();
//     print(allPeople.length)

//     var clusters = d3.nest()
//         .key(function(d) {
//             return d.cluster;
//         })
//         .entries(allPeople)

//     _.each(clusters, function(cluster) {
//         db.sankeyNodes.insert({
//             man: _.map(cluster.values, function(value) {
//                 return value.personid;
//             }),
//             cluster: cluster.key,
//             generation: currentGen + 1,
//             name: 'gen' + (currentGen + 1) + 'cluster' + cluster.key,
//         })
//     })
// }

// //get edges
print('dealing with edges')
db.malePeople.ensureIndex({
    personid: 1,
    fatherid: 1
})
db.malePeople.ensureIndex({
    fatherid: 1,
    personid: 1
})
db.sankeyNodes.ensureIndex({
    name: 1
})

var clusters = db.sankeyNodes.distinct('cluster')
var generations = db.sankeyNodes.distinct('generation');
// _.each(generations, function(generation, idx) {
//     if (generation > 0) {
//         var currentGen = generation;
//         var prevGen = generation - 1;
//         for (var i = 0; i < clusters.length; i++) {
//             for (var j = 0; j < clusters.length; j++) {
//                 var fatherNode = 'gen' + prevGen + 'cluster' + clusters[i];
//                 var childNode = 'gen' + currentGen + 'cluster' + clusters[j];
//                 var edge = {
//                     source: fatherNode,
//                     target: childNode,
//                 }

//                 print(fatherNode)
//                 var fatherids = db.sankeyNodes.findOne({
//                     name: fatherNode
//                 }).man;
//                 var personids = db.sankeyNodes.findOne({
//                     name: childNode
//                 }).man;

//                 var query = {
//                     personid: {
//                         $in: personids
//                     },
//                     fatherid: {
//                         $in: fatherids
//                     }
//                 };
//                 var sourceVal = db.malePeople.distinct('fatherid', query);
//                 var targetVal = db.malePeople.distinct('personid', query);

//                 edge.sourceVal = sourceVal;
//                 edge.targetVal = targetVal;
//                 db.sankeyEdges.save(edge);
//             }
//         }
//     }
// })

//get source part
db.malePeople.ensureIndex({
    personid: 1,
    hasSon: 1
})
_.each(generations, function(generation) {
    _.each(clusters, function(cluster) {
        var fatherNode = 'gen' + generation + 'cluster' + cluster;
        var fatherids = db.sankeyNodes.findOne({
            name: fatherNode
        }).man;

        var t1 = db.malePeople.find({
            personid: {
                $in: fatherids
            },
            hasSon: 1
        }).size()
        var t2 = db.malePeople.find({
            personid: {
                $in: fatherids
            }
        }).size()
        var percentFatherWithChild = t2 === 0 ? 0 : t1 / t2;

        var children = db.malePeople.find({
            fatherid: {
                $in: fatherids
            }
        }).toArray()
        var children_cluster = d3.nest()
            .key(function(d) {
                return d.cluster;
            })
            .entries(children);
        _.each(children_cluster, function(children_one_cluster) {
            var childNode = 'gen' + (generation + 1) + 'cluster' + children_one_cluster.key;
            var source_part = children_one_cluster.values.length / children.length * percentFatherWithChild;
            db.sankeyEdges.update({
                source: fatherNode,
                target: childNode
            }, {
                $set: {
                    sourcePart: source_part
                }
            });
        })
    })
})

//get target part
db.sankeyEdges.find().forEach(function(edge){
    var nChildren=edge.targetVal.length;
    var allChildren_temp=db.sankeyEdges.find({target:edge.target}).toArray();
    var allChildren=d3.sum(allChildren_temp, function(temp){
        return temp.targetVal.length;
    })
    var target_part=nChildren/allChildren;
    edge.targetPart=target_part;
    db.sankeyEdges.save(edge);
})

//recalculate
