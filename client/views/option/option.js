Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor = Template.option.dataProcessor;

    //init
    var list = Template.option.configure.attributeList;
    $('select[multiple]').multipleSelect('setSelects', list);
    Session.set('showAttrs', list)

    Deps.autorun(function() {

        var filter = Session.get('filterMalePeople')
        var malePeople = d3.deepCopyArr(flowConf.malePeople)

        if (_.keys(filter).length !== 0) {
            _.each(filter, function(val, key) {
                malePeople = _.filter(malePeople, function(p) {
                    return p[key] >= val[0] && p[key] < val[1];
                })
            })
        }

        flowConf.malePeople_toUse = malePeople;
        dataProcessor.assignGeneration(flowConf.malePeople_toUse);
        flowConf.malePeopleObj_father_toUse = _.groupBy(malePeople, function(male) {
            return male.fatherid;
        })

        Session.set('malePeopleObj_ready', new Date());
    })

    Deps.autorun(function() {
        var clusters = Session.get('clusterMalePeople');
        if(clusters.length===0) return;

        var malePeople = flowConf.malePeople_toUse;

        dataProcessor.assignCluster(malePeople, clusters);
        flowConf.malePeopleObj_father_toUse = _.groupBy(malePeople, function(male) {
            return male.fatherid;
        })

        Session.set('malePeopleObj_ready', new Date());
    })
}


Template.option.helpers({
    'attributeList': function() {
        return Session.get('showAttrs');
    },
    'settings': function() {
        return {
            placeholder: "Select attributes of interest",
            filter: true,
            multiple: false,
            keepOpen: false,
            onClose: function() {
                var attrs = $('select[multiple]').multipleSelect('getSelects');
                Session.set('showAttrs', attrs);
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
        var dataProcessor = Template.option.dataProcessor;
        var filter = Template.option.configure.filter;
        var query = dataProcessor.processSelection(filter);
        Session.set('filterMalePeople', query);
        filter = {};
    },
    'click #clearBtn': function() {
        var conf= Template.option.configure;
        conf.filter={};
        conf.clusters=[];
        Session.set('filterMalePeople', {});
        Session.set('filterMalePeople', []);
    },
    'click #clusterBtn': function() {
        var dataProcessor = Template.option.dataProcessor;
        var filter = Template.option.configure.filter;
        var cluster = dataProcessor.processSelection(filter);

        var clusters = Template.option.configure.clusters;
        clusters.push({
            order: clusters.length,
            description: cluster,
        });
        Session.set('clusterMalePeople', clusters);
        filter = {};
    },

});
