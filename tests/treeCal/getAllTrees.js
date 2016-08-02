var malePeople = db.malePeople.find().toArray()
var malePeopleObj = {};
_.each(malePeople, function(p) {
    malePeopleObj[p.personid] = p;
})
var malePeopleObj_father = _.groupBy(malePeople, function(p) {
    return p.fatherid;
})

var assignGeneration = function() {

    function trackDown(father, container, path) {
        if (!malePeopleObj_father[father.personid]) return;
        var sons = malePeopleObj_father[father.personid];

        _.each(sons, function(son, i) {
            var label=container.label+'g'+i;
            path.push(label);
            container.children.push({
                label:label,
                children:[],
            })
            trackDown(son, container.children[container.children.length-1], path);
        })
    }

    var ret=[];
    _.each(malePeople, function(p) {
        var tree = { label: '0', children: [], personid: p.personid }
        var path=['0'];
        trackDown(p, tree, path)
        tree.path=path.sort();
        separateGen(tree);
        ret.push(tree);
    })
    return ret;

};


function countG(str) {
    return (str.match(/g/g) || []).length;
}

function separateGen(tree) {
    var map = {}

    _.each(tree.path, function(node) {
        var key = countG(node);
        map[key] ? map[key].push(node) : map[key] = [node];
    })
    var depth = _.max(_.keys(map), function(key) {
        return +key;
    })
    tree.depth=+depth;
    for (var i = 1; i <= depth; i++) {
        var arr = []
        for (var key in map) {
            if (+key <= i) {
                arr = _.union(map[key], arr);
            }
        }
        tree['depth' + i] = arr.sort();
    }
    tree.path=tree.path.join(',')

    return tree;
}

var treeArr=assignGeneration();
db.tree_complete.drop()
db.tree_complete.insert(treeArr)
