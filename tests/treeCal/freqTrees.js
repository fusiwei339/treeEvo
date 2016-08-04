var focusDepth = 2;
var limit = 3;
var attrs = ['birthyear', 'f_bir_age', 'l_bir_age', 'lastage'];

var malePeople = db.malePeople.find().toArray()
var malePeopleObj = {};
_.each(malePeople, function(p) {
    malePeopleObj[p.personid] = p;
})


var ret = []
//get topGroups
var topPatterns= db.tree_complete.aggregate([
    { $match: { depth: focusDepth } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit+5 }
]).map(function(d){
    return d._id;
})
var others=topPatterns.splice(3).join(';');
var topThree=topPatterns;

var selectedPeople = db.tree_complete.find({ depth: focusDepth }).forEach(function(p) {
    var idx = topThree.indexOf(p.path);
    var temp = { group: idx, pattern: topPatterns[idx] ? topPatterns[idx] : others };
    _.each(attrs, function(attr) { temp[attr] = malePeopleObj[p.personid][attr]; })
    ret.push(temp)
});

//get base gruops
var basePatterns=db.tree_complete.aggregate([
    { $match: { depth: focusDepth-1 } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit+2 }
]).map(function(d){
    return d._id;
}).join(';')

var basePeople = db.tree_complete.find({ depth: focusDepth - 1 }).forEach(function(p) {
    var temp = { group: limit, pattern: basePatterns};
    _.each(attrs, function(attr) { temp[attr] = malePeopleObj[p.personid][attr]; })
    ret.push(temp)
})

db.statData.drop()
db.statData.insert(ret)
