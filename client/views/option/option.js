Template.option.rendered = function() {
    var conf = Template.option.configure;
    var flowConf = Template.flow.configure;
    var dataProcessor_option = Template.option.dataProcessor;
    var dataProcessor_flow = Template.flow.dataProcessor;

    //init attr list
    var attrList = Template.option.configure.attributeList;
    $('select[multiple]').multipleSelect('setSelects', attrList);
    Session.set('showAttrs', attrList)

    //init attr list
    function defineSortable() {

        $('#sortableList').sortable({
            stop: function(event, ui) { // fired when an item is dropped
                var el = ui.item.get(0),
                    before = ui.item.prev().get(0),
                    after = ui.item.next().get(0);
                var clusters = Session.get('clusterMalePeople');
                var currentCluster = d3.select(el).data()[0];
                var newClusters = [];

                _.each(clusters, function(c) {
                    if (c.order !== currentCluster.order)
                        newClusters.push(c);
                })
                if (!before) { // moving to the top of the list
                    newClusters.unshift(currentCluster);
                } else if (!after) { // moving to the bottom of the list
                    newClusters.push(currentCluster);
                } else {
                    var nextCluster = d3.select(after).data()[0];
                    var idx = -1;
                    for (var i = 0; i < newClusters.length; i++) {
                        if (newClusters[i].order === nextCluster.order) {
                            idx = i;
                            break;
                        }
                    }
                    newClusters.splice(idx, 0, currentCluster);
                }

                _.each(newClusters, function(c, i) {
                    c.order = i;
                })

                Session.set('clusterMalePeople', newClusters);

            }
        })
    }

    Deps.autorun(function() {
        var clusters = Session.get('clusterMalePeople');

        $('#sortableList').empty();
        d3.select('#sortableList')
            .selectAll('.list-group-item')
            .data(clusters).enter()
            .append('li')
            .attr('class', 'list-group-item')
            .style('background-color', function(d) {
                var colorArr = Template.option.configure.clusterColors;
                return colorArr[d.order];
            })
            .text(function(d) {
                return JSON.stringify(d.description);
            })
        defineSortable();
    })

    Deps.autorun(function() {

        var filter = Session.get('filterMalePeople')
        if(_.isEmpty(flowConf.malePeople)) return;

        var malePeople = d3.deepCopyArr(flowConf.malePeople)

        if (_.keys(filter).length !== 0) {

            malePeople = _.filter(malePeople, function(p) {
                var flag = true;
                _.each(filter, function(val, key) {
                    var flagTemp = (p[key] >= val[0] && p[key] < val[1])
                    flag = flag && flagTemp;
                })

                return flag;
            })
        }

        dataProcessor_flow.calGlobalData_toUse(malePeople, true);
        Session.set('malePeopleObj_ready', new Date());
    })

    Deps.autorun(function() {

        var clusters = Session.get('clusterMalePeople');
        var malePeople = flowConf.malePeople_toUse;
        if(_.isEmpty(malePeople)) return;

        if (clusters.length > 1) {
            dataProcessor_option.assignCluster(malePeople, clusters);
        } else {
            dataProcessor_option.clearCluster(malePeople);
        }

        dataProcessor_flow.calGlobalData_toUse(malePeople, false);

        Session.set('malePeopleObj_ready', new Date());
    })
}


Template.option.helpers({
    'attributeList': function() {
        return Session.get('showAttrs');
    },
    'selectSettings': function() {
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
    'selectOptions': function() {
        var list = Template.option.configure.attributeList;
        return _.map(list, function(d) {
            return {
                label: d,
                value: d,
            }
        })
    },
    'filter': function() {
        var obj = Session.get('filterMalePeople');
        return JSON.stringify(obj);
    },
    'clusters': function() {
        Session.get('clusterChanged');
        var clusters = Session.get('clusterMalePeople');
        var temp = clusters.sort(function(a, b) {
                return +a.order - (+b.order);
            })
            // console.log(temp)
        return temp;
    },
    'clusterChanged': function() {
        Session.get('clusterChanged');
        return true;
    },
    'stringify': function(obj) {
        return JSON.stringify(obj);
    },
    'getColor': function(order) {
        var colorArr = Template.option.configure.clusterColors;
        return colorArr[order];
    },


})

Template.option.events({
    'click #filterBtn': function() {
        var dataProcessor = Template.option.dataProcessor;
        var filter = Template.option.configure.filter;
        var query = dataProcessor.processSelection(filter);
        Template.option.configure.filter = {};
        Session.set('filterMalePeople', query);
    },
    'click #clearBtn': function() {
        var conf = Template.option.configure;
        conf.filter = {};
        conf.clusters = [{ description: 'all', order: 0 }];
        Session.set('filterMalePeople', {});
        Session.set('nodeSelected', null);
        Session.set('clusterMalePeople', [{ description: 'all', order: 0 }]);
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
        clusters[0].description = 'others';
        Template.option.configure.filter = {};
        Session.set('clusterMalePeople', clusters);
    },

});
