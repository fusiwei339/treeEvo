Meteor.startup(function() {
    Session.set('scaleBar', 'scaleByDefault');
    Session.set('sankeyGraph_toDraw', null);
    Session.set('filterMalePeople', {});
    Session.set('clusterMalePeople', []);
})
