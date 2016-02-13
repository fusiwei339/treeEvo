db.sankeyNodes.drop()
db.sankeyEdges.drop()

var initGen = 0;
//1st geneeration
print('preparing')
var allPeople = db.malePeople.find().toArray();
var allPeopleObj = {}
for (var i = 0, len = allPeople.length; i < len; i++) {
    var people = allPeople[i];
    allPeopleObj[people.personid] = people;
}
var allPeopleObj_father = _.groupBy(allPeople, function(people) {
    return people.fatherid;
})
var nodesByGen = []

function getNextGen(man) {
    var nextGen = []
    for (var i = 0, len = man.length; i < len; i++) {
        var father = man[i];
        var children = allPeopleObj_father[father.personid];
        [].push.apply(nextGen, children);
    }
    return nextGen;
}
function mapIds(arr){
    return _.map(arr, function(d){
        return d.personid;
    })
}

print('dealing with all generations')
var currentGen = allPeople;
while (currentGen.length > 0) {
    var children = getNextGen(currentGen);
    nodesByGen.push({
        generation: initGen++,
        man: currentGen,
    })
    currentGen = children;
}

print('generating nodes')
    //get nodes
var nodes = []
_.each(nodesByGen, function(gen) {
    var clusters = d3.nest()
        .key(function(d) {
            return d.cluster;
        })
        .entries(gen.man);
    _.each(clusters, function(cluster) {
        nodes.push({
            generation: gen.generation,
            cluster: cluster.key,
            man: mapIds(cluster.values),
            children: mapIds(getNextGen(cluster.values)),
            name: 'gen' + gen.generation + 'cluster' + cluster.key,
        })
    })
})
db.sankeyNodes_test.drop();
db.sankeyNodes_test.insert(nodes)


// // //get edges
print('dealing with edges')

var edges=getNodeConnections(nodes);
print(edges.length)
db.sankeyEdges_test.drop();
db.sankeyEdges_test.insert(edges);

function getNodeConnections (nodes) {
    var nodesByGen = _.groupBy(nodes, function(node) {
        return node.generation;
    })
    var generations = _.keys(nodesByGen).sort(function(a, b) {
        return +a - (+b);
    })

    var getEdge = function(fatherNode, sonNode) {
        var fatherArr = fatherNode.man;
        var sonArr = sonNode.man;
        var edge = {
            source: fatherNode.name,
            target: sonNode.name
        }
        var peopleArr = []
        var possibleSons = {}
        _.each(fatherArr, function(father) {
            var possibleSonsTemp = allPeopleObj_father[father];
            _.each(possibleSonsTemp, function(temp) {
                possibleSons[temp.personid] = temp;
            })
        })
        _.each(sonArr, function(son) {
            var oneMatch = possibleSons[son];
            if (oneMatch) peopleArr.push(oneMatch);
        })

        edge.sourceVal = mapIds(peopleArr);
        edge.targetVal = mapIds(peopleArr);
        edge.sourcePart=edge.sourceVal.length/fatherNode.children.length;
        edge.targetPart=edge.targetVal.length/sonNode.man.length;

        if (!edge.sourceVal.length) return null;
        return edge;
    }

    var edges = []
    for (var i = 1; i < generations.length; i++) {
        var fatherNodes = nodesByGen[generations[i - 1]];
        var sonNodes = nodesByGen[generations[i]];
        _.each(fatherNodes, function(fatherNode) {
            _.each(sonNodes, function(sonNode) {
                var edge = getEdge(fatherNode, sonNode);
                if (edge) edges.push(edge);
            })
        })
    }

    return edges;

}
