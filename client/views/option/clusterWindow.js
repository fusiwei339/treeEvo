Template.clusterWindow.rendered = function() {

    Deps.autorun(function() {
        Session.get('clusterBtn');
        var optionItem_conf = Template.optionItem.configure;
        console.log(optionItem_conf.clusterRange)
    })


}


Template.clusterWindow.helpers({
    'clusters':function(){
        Session.get('clusterBtn');
        var optionItem_conf = Template.optionItem.configure;
        return JSON.stringify(optionItem_conf.clusterRange);
    },
})

Template.clusterWindow.events({
    'click #finishClusterDef': function(e, template) {
        console.log('finish')
    }
});
