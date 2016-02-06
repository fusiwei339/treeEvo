//flatten
/*
var w = 600,
    h = 600,
    padding = 10;

var pack = d3.layout.pack()
    .size([w - padding, h - padding])
    .value(function(d) {
        return d.age;
    })
    .children(function(d) {
        return d.children;
    })

db.test.drop();
db.family.find().forEach(function(tree) {
    var nodes = pack.nodes(tree)
    _.each(nodes, function(d) {
        delete d.children;
        delete d.parent;
    })
    db.test.insert(nodes)
});
*/

//cal first_birth
var coll='malePeople'
db[coll].ensureIndex({fatherid:1})
db[coll].find().forEach(function(people){
	var arr=db[coll].find({fatherid:people.personid}).toArray();
	var minYear=d3.min(arr, function(item){
		return item.birthyear;
	})
	people.nSon=arr.length;
	if(!minYear)minYear=0;
	var first_birth=minYear-people.birthyear;
	if(first_birth>0 && first_birth<100){
		people.first_birth=first_birth;
	}else{
		people.first_birth=0;
	}
	db[coll].save(people)
})
