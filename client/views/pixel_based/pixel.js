Meteor.startup(function() {
    Session.setDefault('scaleBar', 'scaleByUni');
    // Session.set('sankeyGraph_toDraw', null);
    // Session.set('filterMalePeople', {});
    // Session.set('clusterMalePeople', [{ description: 'all', order: 0 }]);

    Session.setDefault('targetDepth', 1)
    Session.setDefault('editBar', null)
    Session.setDefault('selectedNode', null)
    Session.setDefault('groupMethod', null)
    Session.setDefault('distributionName', 'lean')

})
