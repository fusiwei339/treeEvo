Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;

    Deps.autorun(function() {

        var filter = Session.get('filterMalePeople')
        if (!filter) return;

        var malePeople = d3.deepCopyArr(flowConf.malePeople)
        _.each(filter, function(val, key) {
            malePeople = _.filter(malePeople, function(p) {
                return p[key] >= val[0] && p[key] < val[1];
            })
        })
        flowConf.malePeople_toUse = malePeople;
        flowConf.malePeopleObj_father_toUse = _.groupBy(malePeople, function(male) {
            return male.fatherid;
        })

        Session.set('malePeopleObj_ready', new Date());
    })
}


Template.option.helpers({
    'attributeList': function() {
        return Template.option.configure.attributeList;
    },
    'settings': function() {
        return {
            placeholder: "Select attributes of interest",
            filter: true,
            multiple: false,
            keepOpen: false,
            onClose: function() {
                console.log($('select[multiple]').multipleSelect('getSelects'))
            },
        };
    },
    'options': function() {
        var list = Template.option.configure.attributeList;
        return _.map(list, function(d) {
            return {
                label: d,
                value: d,
            }
        })
    }
})

Template.option.events({
    'click #filterBtn': function() {
        var filter = Template.option.configure.filter;
        var query = {};
        _.each(filter, function(val, key) {
            if (val[0] !== val[1]) {
                query[key] = val;
            }
        })
        Session.set('filterMalePeople', query);
    },
    'click #scaleByUni': function() {},
    'click #scaleByDefault': function() {},

});
