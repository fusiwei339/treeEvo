var _=require('./underscore.js')

var calLean = function(tree) {

    function getDesCount(root) {
        var total = 0;

        function walk(root) {
            if (root.children) {
                total += root.children.length;
            }
            _.each(root.children, child => {
                walk(child);
            })
        }
        walk(root);
        root.nDes = total;
    }

    function getAllDesCount(root) {
        getDesCount(root);
        _.each(root.children, child => {
            getAllDesCount(child);
        })
    }
    getAllDesCount(tree);
    console.log(JSON.stringify(tree))

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
                if (i < mid) left += (child.nDes);
                else right += (child.nDes);
            })
        } else {
            _.each(root.children, (child, i) => {
                if (i < mid) left += (child.nDes);
                else if (i > mid) right += (child.nDes);
            })
            trackDown(root.children[mid]);
        }
    }
    trackDown(tree);
    if (left === right) return 0;
    return (left - right) / (tree.nDes+1);
}

var seq2tree = function(seq) {
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

var tree=[
    "0",
    "0g0",
    "0g0g0",
    "0g0g0g0",
    "0g0g0g1",
    "0g0g0g2",
    "0g0g0g3",
    "0g0g0g4",
    "0g0g1"
]

console.log(calLean(seq2tree(tree)))