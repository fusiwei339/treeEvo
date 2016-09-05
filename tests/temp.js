var fs = require('fs')

var nodes = require('../public/sankeyNodes.json');
var edges = require('../public/sankeyEdges.json');

var graph = {
    "nodes": nodes,
    "edges": edges
}

fs.writeFileSync('../public/sankeyData.json', JSON.stringify(graph))

// db.getCollection('sankeyNodes').find({ cluster: 'continue' }).forEach(function(d) {
//     for (var i = 0; i < d.trees.length; i++) {
//         var temp = d.trees[i];
//         temp.lean= calLean(seq2tree(temp.pattern));
//     }
//     db.sankeyNodes.save(d);
// })

var getTreemapData = function(nodes, treemapConf) {
    var levels = _.groupBy(nodes, function(d) {
        return d.model_level;
    })
    var arr = _.map(levels, function(d) {
        return d.length;
    })
    var areas = d3.treemap_algo(arr, treemapConf)
    var ret = []
    for (var level in levels) {
        var oneLevel = levels[level];
        for (var j = 0; j < areas.length; j++) {
            if (oneLevel.length === areas[j].text) {
                ret.push({
                    rect: areas[j].rect,
                    weight: areas[j].text,
                    node: oneLevel,
                    level: level,
                })
            }
        }
    }
    return ret;
};


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
