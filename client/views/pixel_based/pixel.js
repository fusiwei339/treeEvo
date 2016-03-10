Meteor.startup(function() {
    Session.set('scaleBar', 'scaleByDefault');
    Session.set('sankeyGraph_toDraw', null);
    Session.set('filterMalePeople', {});
    Session.set('clusterMalePeople', [{ description: 'all', order: 0 }]);
})
