db.malePeople.ensureIndex({
    personid: 1,
    fatherid: 1,
    cluster: 1,
})
db.malePeople.ensureIndex({
    fatherid: 1,
    personid: 1
})
db.malePeople.ensureIndex({
    cluster: 1
})
db.sankeyNodes.ensureIndex({
    name: 1
})
db.malePeople.ensureIndex({
    personid: 1,
    cluster: 1
})
db.malePeople.ensureIndex({
    fatherid: 1,
    cluster: 1
})
db.malePeople.ensureIndex({
    personid: 1,
    has_son: 1
})

db.sankeyNodes.drop()
db.sankeyEdges.drop()

var initGen = 0,
    maxGen = 9;
//1st geneeration
print('dealing with 1st geneeration')
var nodes = [];
var clusters = db.malePeople.distinct('cluster');
_.each(clusters, function(cluster) {
    var man = db.malePeople.distinct('personid', {
        cluster: cluster
    });
    nodes.push({
        man: man,
        cluster: cluster,
        generation: initGen,
        name: 'gen' + initGen + 'cluster' + cluster,
    })
})
db.sankeyNodes.insert(nodes)

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

print('dealing with other geneerations')
for (var currentGen = initGen; currentGen < maxGen; currentGen++) {

    //get fatherids
    var nodes = db.sankeyNodes.find({
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

    var clustersTemp = _.groupBy(allPeople, function(d) {
        return d.cluster;
    })

    _.each(clusters, function(cluster) {
        var man = clustersTemp[cluster] ? _.map(clustersTemp[cluster], function(d) {
            return d.personid;
        }) : [];
        db.sankeyNodes.insert({
            man: man,
            cluster: cluster,
            generation: currentGen + 1,
            name: 'gen' + (currentGen + 1) + 'cluster' + cluster,
        })
    })
}

// //get edges
print('dealing with edges')

//generate all edges
var clusters = db.sankeyNodes.distinct('cluster')
var generations = db.sankeyNodes.distinct('generation');
_.each(generations, function(generation, idx) {
    if (generation > 0) {
        var currentGen = generation;
        var prevGen = generation - 1;
        for (var i = 0; i < clusters.length; i++) {
            for (var j = 0; j < clusters.length; j++) {
                var fatherNode = 'gen' + prevGen + 'cluster' + clusters[i];
                var childNode = 'gen' + currentGen + 'cluster' + clusters[j];
                var edge = {
                    source: fatherNode,
                    target: childNode,
                }
                db.sankeyEdges.save(edge);
            }
        }
    }
})



var parseName = function(str) {
    str = str.replace('gen', '').replace('cluster', ',');
    var arr = str.split(',');
    return {
        generation: +arr[0],
        cluster: arr[1]
    };
}

//recalculate
print('get source and target part')
db.sankeyEdges.find().forEach(function(edge) {
    //cal target val
    var fatherNode = parseName(edge.source);
    print(edge.target)
    var personids = db.sankeyNodes.findOne({
        name: edge.target
    }).man;

    var allFather = db.malePeople.distinct('fatherid', {
        personid: {
            $in: personids
        }
    });
    edge.targetVal = db.malePeople.distinct('personid', {
        personid: {
            $in: allFather
        },
        cluster: fatherNode.cluster
    });
    edge.targetPart = edge.targetVal.length / allFather.length;

    //cal source val;
    var fatherids = db.sankeyNodes.findOne({
        name: edge.source
    }).man;
    var childrenNode = parseName(edge.target);

    var allChildren = db.malePeople.distinct('personid', {
        fatherid: {
            $in: fatherids
        }
    });
    edge.sourceVal = db.malePeople.distinct('personid', {
        fatherid: {
            $in: fatherids
        },
        cluster: childrenNode.cluster,
    });
    // var allFatherWithSon_parentNode = db.malePeople.find({
    //     personid: {
    //         $in: fatherids
    //     },
    //     has_son: 1,
    // }).size();
    // var allFather_parentNode = db.malePeople.find({
    //     personid: {
    //         $in: fatherids
    //     },
    // }).size();
    // edge.sourcePortion=(allFatherWithSon_parentNode / allFather_parentNode)
    edge.sourcePart = (edge.sourceVal.length / allChildren.length);


    db.sankeyEdges.save(edge);


})
