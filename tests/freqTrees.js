function flattenTree(tree) {
    var nodes = [];

    function walk(root) {
        nodes.push(root.label);
        _.each(root.children, function(child) {
            walk(child);
        })
    }
    walk(tree);
    return nodes;
}

function countG(str) {
    return (str.match(/g/g) || []).length;
}


var trees = db.trees.find().toArray()
_.each(trees, function(tree) {
    var nodes = flattenTree(tree)
    tree.path = nodes.sort();
})

var trees = db.trees2.find().toArray();
var ret = []
_.each(trees, function(tree, idx) {
    var map = {}

    _.each(tree.path, function(node) {
        var key = countG(node);
        map[key] ? map[key].push(node) : map[key] = [node];
    })
    var depth = _.max(_.keys(map), function(key) {
        return +key;
    })
    for (var i = 1; i <= depth; i++) {
        var arr = []
        for (var key in map) {
            if (+key <= i) {
                arr = _.union(map[key], arr);
            }
        }
        tree['depth' + i] = arr.sort();
    }
    ret.push(tree);
})

db.tree2.drop()
db.tree2.insert(ret)

