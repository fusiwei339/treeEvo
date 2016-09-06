var attrs = ['lean', 'count', 'population']
var ret = {}
_.each(attrs, attr => {
    var min = Number.POSITIVE_INFINITY
    var max = Number.NEGATIVE_INFINITY
    if (attr === 'population') {
        db.sankeyNodes.find({ cluster: '0' }).forEach(node => {
            _.each(node.trees, tree => {
                var temp = tree.pattern.length;
                if (temp < min) min = temp;
                if (temp > max) max = temp;
            })
        })

    } else {
        db.sankeyNodes.find({ cluster: '0' }).forEach(node => {
            _.each(node.trees, tree => {
                if (tree[attr] < min) min = tree[attr];
                if (tree[attr] > max) max = tree[attr];
            })
        })
    }
    ret[attr]=[min, max]

})

print(JSON.stringify(ret))
