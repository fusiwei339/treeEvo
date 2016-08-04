var depth = [1, 2, 3, 4, 5, 6, 7, 8, 9]
var ret = []
_.each(depth, d=> {
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
