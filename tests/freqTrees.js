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


function sortObj(obj){
	var arr=[];
	_.each(obj, function(val, key){
		arr.push([val, key])
	})
	arr.sort(function(a, b){
		return a[0].length-b[0].length;
	})
	var ret={}
	_.each(arr, function(elem, idx){
		if(idx<5){
			ret[elem[1]]=elem[0];
		}
	})
	return ret;
}
var depths = [2, 3, 4, 5, 6];
_.each(depths, function(depth) {
	var query={};
	var key='depth'+depth;
	query[key]={$exists:true};
    var ids = db.trees_complex.find(query).toArray()
    var patterns=_.groupBy(ids, function(id){
    	return id[key];
    })
    patterns=sortObj(patterns);

})
