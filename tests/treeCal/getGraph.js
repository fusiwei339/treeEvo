var graph = { nodes: [], edges: [] }
var patterns = db.patternsDepth.find().toArray();
var groupByDepth = d3.nest()
    .key(d => d.depth)
    .sortKeys(d3.ascending)
    .entries(patterns)

function linking(son, parents) {
    function countG(str) {
        return (str.match(/g/g) || []).length;
    }

    function getMinDepth(arr) {
        var depths = _.map(arr, e => countG(e))
        var ret = _.min(depths)
        return ret;
    }

    function foundLinking(son, parent) {
        var a = _.intersection(son.pattern, parent.pattern)
        var b = parent.pattern
        if (_.difference(a, b).length!==0) {
            return false;
        } else {
            var diff = _.difference(son.pattern, parent.pattern);
            if (getMinDepth(diff) === (parent.depth + 1)) {
                son.parent = parent.pattern.join(',');
                return true;
            }
            return false;
        }
    }
    for (var i = 0, len = parents.length; i < len; i++) {
        var parent = parents[i];
        if(foundLinking(son, parent))
        	break;
    }

    return son;

}

_.each(groupByDepth, (group, i) => {

    var depth = group.key;
    var freqs = group.values
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

    if (i === 0) {
    	var tempNodes=freqs.slice(0, 5);
    	_.each(tempNodes, node=>{
    		node.parent='root'
    		graph.nodes.push(node)
    	})
        return;
    }

    var ret=[]
    _.each(freqs, son => {
        var parents = groupByDepth[i - 1].values;
        var linkedSon=linking(son, parents)
        ret.push(linkedSon)
    })
    graph.nodes.push(...ret);
})

var tree={pattern:'root', children:[]}
var nodemap={}
_.each(graph.nodes, node=>{
	nodemap[node.pattern.join(',')]=node;
})

var node_parent=_.groupBy(graph.nodes, node=>node.parent)
_.each(node_parent, (val, key)=>{
	if(key==='root') return;
	if(!nodemap[key]) {
		print(key)
		return;
	}
	nodemap[key].children=val.slice(0, 4);
})
_.each(graph.nodes, node=>{
	if(node.depth===1){
		tree.children.push(node);
	}
})
db.graph.drop()
db.graph.insert(tree)
