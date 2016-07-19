Meteor.publish('sankeyNodes', function() {
    return Coll.sankeyNodes.find();
})

Meteor.publish('test', function() {
    return Coll.test.find();
})

// Meteor.publish('sankeyEdges', function(){
// 	return Coll.sankeyEdges.find();
// })

// Meteor.publish('malePeopleLite', function(){
// 	return Coll.malePeopleLite.find();
// })

Coll.clusters.allow({
    insert: function(userId, doc) {
        return true;
    },
    remove: function() {
        return true;
    }
})

var exec = Npm.require('child_process').exec;
Meteor.methods({
    'gspan' () {
        exec('python /Users/siweifu/project/lineage/tests/pygspan/freqPaths.py', Meteor.bindEnvironment(function(err, stdout, stderr) {}))
    },
    'test' () {
        exec('cd /../web.browser/app/ && ls -al', Meteor.bindEnvironment(function(err, stdout, stderr) {
        	console.log(stdout)
        	console.log(stderr)
        }))
    },
    'insertClusters' (clusters) {
        Coll.clusters.remove({});
        _.each(clusters, cluster => Coll.clusters.insert(cluster));
    },
})
