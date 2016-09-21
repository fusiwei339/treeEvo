var depth = [1, 2, 3, 4, 5, 6, 7, 8, 9]
var ret = []
_.each(depth, d => {
    var match = { $match: {} }
    match.$match['depth' + d] = { $exists: true }
    ret.push(...db.tree_complete.aggregate([
        match,
        { $group: { _id: '$depth' + d, count: { $sum: 1 }, personids: { $push: "$personid" } } },
        { $sort: { count: -1 } },
    ]).map(pattern => {
        return {
            pattern: pattern._id,
            personids: pattern.personids,
            count: pattern.count,
            depth: d
        }
    }))
})

db.patternsDepth.drop()
db.patternsDepth.insert(ret)


var min=0, max=0;
db.getCollection('sankeyNodes').find().forEach(function(doc){
    var trees=doc.trees;
    for(var i=0;i<trees.length;i++){
        var temp=trees[i];
        if(temp.lean<min) min=temp.lean;
        if(temp.lean>max) max=temp.lean;
    }
})
print(min)
print(max)

db.getCollection('sankeyNodes').find({depth:2}).forEach(function(doc){
    var trees=doc.trees;
    for(var i=0;i<trees.length;i++){
        var temp=trees[i];
        if(temp.lean>1) {
            print(temp.pattern)
            break;
        }
    }
})