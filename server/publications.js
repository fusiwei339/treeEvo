Meteor.publish('sankeyNodes', function() {
    return Coll.sankeyNodes.find();
})

Meteor.publish('test', function() {
    return Coll.test.find();
})

Meteor.publish('clusters', function() {
    return Coll.clusters.find();
})

Meteor.publish('r', function() {
    return Coll.r.find();
})

Meteor.publish('patternsDepth', function(depth) {
    return Coll.patternsDepth.find({ depth: depth }).limit(10);
})


Coll.clusters.allow({
    insert: function(userId, doc) {
        return true;
    },
    remove: function() {
        return true;
    }
})

var exec = Npm.require('child_process').exec;
var io = Npm.require('socket.io-client')('http://localhost:22222');

Meteor.methods({
    'gspan' () {
        exec('python /Users/siweifu/project/lineage/tests/pygspan/freqPaths.py', Meteor.bindEnvironment(function(err, stdout, stderr) {}))
    },
    'regression' () {
        exec('cd /Users/siweifu/project/lineage/tests/treeCal/ && ./run.sh', Meteor.bindEnvironment(function(err, stdout, stderr) {
            console.log(stdout)
            console.log(stderr)
        }))
    },
    'insertClusters' (clusters) {
        Coll.clusters.remove({});
        Coll.clusters.insert({ data: clusters });
        exec('cd /Users/siweifu/project/lineage/tests/treeCal/ && ./reformatCluster.sh', Meteor.bindEnvironment(function(err, stdout, stderr) {
            console.log(stdout)
            console.log(stderr)
        }))
    },
    // 'sendData' (data) {
    //     io.on('connect', function(){
    //         console.log('connected')
    //     });
    //     io.on('event', function(data){
    //         console.log('data')
    //     });
    //     io.on('disconnect', function(){});
    // },

})
