Meteor.publish('nchForum', function(courseId){
	return Coll.nchForum.find({courseId:courseId});
})

Meteor.publish('threads', function(courseId, arr){
	return Coll.nchForum.find({courseId:courseId, threadId:{$in:arr}});
})

// Meteor.publish('events', function(courseId){
// 	return Coll.events.find({courseId:courseId});
// })

Meteor.publish('graph', function(courseId){
	return Coll.graph.find({courseId:courseId});
})

Meteor.publish('overview', function(courseId){
	return Coll.overview.find({courseId:courseId});
})

Meteor.publish('userInfo', function(courseId){
	return Coll.userInfo.find({courseId:courseId});
})

Meteor.publish('threadInfo', function(courseId){
	return Coll.threadInfo.find({courseId:courseId});
})
