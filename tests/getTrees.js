var roots= db.getCollection('output').find({ depth: { $gt: 1 } }).toArray()
var malePeople=db.origin.find().toArray();
var malePeopleObj = {}

_.each(malePeople, function(male) {
    malePeopleObj[male.personid] = male;
});
malePeopleObj_father = _.groupBy(malePeople, function(male) {
    return male.fatherid;
});

function getTree(root) {
    var ret = { label: '0', personid: root.personid, children: [] };

    function trackDown(father, obj) {
        if (!malePeopleObj_father[father.personid]) return;
        var sons = malePeopleObj_father[father.personid];

        _.each(sons, function(son, idx) {
            obj.children.push({ label: obj.label + 'g' + idx, children: [] })
            trackDown(son, obj.children[obj.children.length-1])
        })
    }

    trackDown(root, ret);
    return ret;
}


var result=[]
_.each(roots, function(male){
	var temp=getTree(male)
	result.push(temp)
})

db.trees.drop();
db.trees.insert(result)
