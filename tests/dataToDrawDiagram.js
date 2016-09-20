var node = db.getCollection('sankeyNodes').findOne({ depth: 2, cluster: '0' })
var ret = []
for (var i = 0, len = node.trees.length; i < len; i++) {
    var tree = node.trees[i];
    for (var j = 0; j < tree.personids.length; j++) {
        ret.push(tree.lean);
    }
}

db.test.drop()
db.test.insert({test:ret})