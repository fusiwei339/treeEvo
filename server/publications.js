Meteor.publish('sankeyNodes', function(){
	return Coll.sankeyNodes.find();
})

Meteor.publish('sankeyEdges', function(){
	return Coll.sankeyEdges.find();
})
