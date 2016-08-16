// db.patternsDepth.find().forEach(d=>{
//  d.pattern=d.pattern.sort();
//  db.patternsDepth.save(d);
// })
var patterns = db.patternsDepth.find().toArray()
    // var pattern_parent = _.groupBy(patterns, pattern => pattern.parent);

var nodes = sankeyNodes(patterns);
db.sankeyNodes.drop()
db.sankeyNodes.insert(nodes)

var depth = [1, 2, 3, 4, 5, 6, 7, 8, 9]
var ret = []
_.each(depth, d => {

    var ids = db.tree_complete.find({ depth: d }).toArray()
    var trees=_.uniq(_.map(ids, id=>id.path))
    var treeArr=_.map(trees, tree=>{
        var personids=db.tree_complete.distinct('personid', {depth:d, path:tree});
        return {
            pattern:tree.split(','),
            personids:personids,
            count:personids.length,
            depth:d+1,
        }
    })
    assignParent(treeArr)

    var node = {
        depth: d+1,
        cluster: 'cutoff',
        trees: treeArr,
        people: _.map(ids, id=>id.personid),
        name: 'depth' + d + 'cluster' + 'cutoff',
    }
    ret.push(node)

})

db.sankeyNodes.insert(ret)


var nodes=db.sankeyNodes.find().toArray();
var edges = sankeyEdges(nodes);
db.sankeyEdges.drop()
db.sankeyEdges.insert(edges)

// db.sankeyData.drop()

// db.sankeyData.insert({
//  nodes:nodes,
//  edges:edges,
// })





// var patterns_with_parent=assignParent(patterns);
// db.patternsDepth_copy.drop()
// db.patternsDepth_copy.insert(patterns_with_parent)

function assignCluster(patterns) {
    var ret = []
    _.each(patterns, pattern => {
        var lean = calLean(seq2tree(pattern.pattern));
        if (lean < 0) pattern.cluster = -1;
        else if (lean === 0) pattern.cluster = 0;
        else pattern.cluster = 1;
        ret.push(pattern)
    })
    return ret;
}

function assignParent(patterns) {
    function countG(str) {
        return (str.match(/g/g) || []).length;
    }

    function separateGen(tree) {
        var map = {}

        _.each(tree, function(node) {
            var key = countG(node);
            map[key] ? map[key].push(node) : map[key] = [node];
        })
        var depth = _.max(_.keys(map), function(key) {
            return +key;
        })

        delete map[depth];
        return map;
    }

    _.each(patterns, pattern => {
        var gens = separateGen(pattern.pattern);
        var path = []
        _.each(gens, (val, key) => {
            path.push(...val);
        })
        pattern.parent = path;
    })
    return patterns;
}

function sankeyNodes(patterns) {
    var nodes = []
    var groupByDepth = d3.nest()
        .key(function(d) {
            return d.depth;
        })
        .entries(patterns);

    _.each(groupByDepth, oneDepth => {
        var patterns = oneDepth.values;
        var clusters = d3.nest()
            .key(function(d) {
                return d.cluster;
            })
            .entries(patterns);

        _.each(clusters, function(cluster) {
            var people = [];
            _.each(cluster.values, tree => people.push(...tree.personids))
            nodes.push({
                depth: +oneDepth.key,
                cluster: cluster.key,
                trees: cluster.values,
                people: people,
                name: 'depth' + oneDepth.key + 'cluster' + cluster.key,
            })
        })
    })
    return nodes;
}

function sankeyEdges(ndoes) {
    var nodesByDepth = _.groupBy(nodes, function(node) {
        return node.depth;
    })
    var depths = _.keys(nodesByDepth).sort(function(a, b) {
        return +a - (+b);
    })

    var getEdge = function(fatherNode, sonNode) {
        var fatherArr = fatherNode.trees;
        var sonArr = sonNode.trees;
        var edge = {
            source: fatherNode.name,
            target: sonNode.name
        }
        var source = [],
            target = [];
        var intersection = _.intersection(fatherNode.people, sonNode.people)

        print(intersection.length)
        edge.sourceVal = intersection;
        edge.targetVal = intersection;
        edge.sourcePart = edge.sourceVal.length / fatherNode.people.length;
        edge.targetPart = edge.targetVal.length / sonNode.people.length;

        if (!intersection.length) return null;
        return edge;
    }

    var edges = []
    for (var i = 1; i < depths.length; i++) {
        var fatherNodes = nodesByDepth[depths[i - 1]];
        var sonNodes = nodesByDepth[depths[i]];
        _.each(fatherNodes, function(fatherNode) {
            _.each(sonNodes, function(sonNode) {
                var edge = getEdge(fatherNode, sonNode);
                if (edge) edges.push(edge);
            })
        })
    }

    return edges;
}

function calLean(tree) {

    function getDesCount(root) {
        var total = 0;

        function walk(root) {
            if (root.children) {
                total += root.children.length;
            }
            _.each(root.children, child => {
                getDesCount(child);
            })
        }
        walk(root);
        root.nDes = total + 1;
    }

    function getAllDesCount(root) {
        getDesCount(root);
        _.each(root.children, child => {
            getAllDesCount(child);
        })
    }
    getAllDesCount(tree);

    var left = 0,
        right = 0;

    function trackDown(root) {
        if (!root.children || root.children.length == 0) return;
        else if (root.children.length === 1) {
            trackDown(root.children[0])
            return;
        }

        var mid = Math.floor(root.children.length / 2);
        if (root.children.length % 2 === 0) {
            _.each(root.children, (child, i) => {
                if (i < mid) left += child.nDes;
                else right += child.nDes;
            })
        } else {
            _.each(root.children, (child, i) => {
                if (i < mid) left += child.nDes;
                else if (i > mid) right += child.nDes;
            })
            trackDown(root.children[mid]);
        }
    }
    trackDown(tree);
    if (left === right) return 0;
    return (left - right) / (left + right);
}


function seq2tree(seq) {
    var ret = { label: '0', children: [] };
    seq = seq.sort();
    var flag = true;
    if (seq[0] !== '0') return {};

    for (var i = 1; i < seq.length; i++) {
        var item = seq[i];
        var elems = item.split('g');
        elems.shift();
        flag = walk(elems, ret);
        if (flag) continue;
        else return {};
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
};
