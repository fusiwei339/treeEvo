var malePeopleObj = {},
    malePeopleObj_father = {};

var malePeople = db.malePeople.find().toArray();

_.each(malePeople, function(male) {
    malePeopleObj[male.personid] = male;
});
malePeopleObj_father = _.groupBy(malePeople, function(male) {
    return male.fatherid;
});

function trackUp(people) {
    if (!malePeopleObj[people.fatherid]) {
        people.generation = 0;
    } else {
        trackUp(malePeopleObj[people.fatherid]);
    }
}


_.each(malePeople, function(male) {
    trackUp(male);
})

var man = _.filter(malePeople, function(d) {
    return d.generation === 0;
})
var currentGen = 0;
_.each(man, function(p) {
    trackDown(p, currentGen);
})


function trackDown(father, depth){
    if(! malePeopleObj_father[father.personid]) return;
    var sons = malePeopleObj_father[father.personid];
    _.each(sons, function(son) {
        son.generation = depth+ 1
        trackDown(son, son.generation)
    })
}

db.malePeople_test.drop()
db.malePeople_test.insert(malePeople)
