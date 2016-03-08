Meteor.startup(function() {
    Session.set('scaleBar', 'scaleByUni');
    Session.set('sankeyGraph_toDraw', null);
    Session.set('filterMalePeople', null);
})
