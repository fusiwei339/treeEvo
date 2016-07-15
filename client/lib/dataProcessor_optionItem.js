Template.optionItem.dataProcessor = function() {
    var ret = {
        version: 0.1
    };

    var conf = Template.optionItem.configure;

    ret.getOption = function(malePeople, attr) {
        var vals = _.uniq(_.map(malePeople, function(d) {
            return d[attr];
        }));
        var xDomain = d3.extent(vals);
        switch (attr) {
            case 'SON_COUNT':
                return {
                    nBins: vals.length,
                    range: xDomain,
                    svgStr: attr,
                    isConti: false,
                    filter: [],
                };
            case 'birthyear':
                return {
                    isConti: true,
                    svgStr: attr,
                    filter: [],
                    // range: xDomain,
                };
            case 'lastage':
                return {
                    isConti: true,
                    svgStr: attr,
                    filter: [],
                    range: [0, 100],
                };
            case 'f_bir_age':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                    filter: [" "],
                };
            case 'l_bir_age':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                    filter: [" "],
                };
        }

    }

    return ret;
}();

Template.option.dataProcessor = function() {
    var ret = {
        version: 0.1,
    }


    ret.assignGeneration = function(malePeople) {
        var flowConf = Template.flow.configure;
        var malePeopleObj = flowConf.malePeopleObj_toUse,
            malePeopleObj_father = flowConf.malePeopleObj_father_toUse;

        function trackUp(people) {
            if (!malePeopleObj[people.fatherid]) {
                people.generation = 0;
            } else {
                trackUp(malePeopleObj[people.fatherid]);
            }
        }

        _.each(malePeople, function(male) {
            trackUp(male);
        })

        function trackDown(father, depth) {
            if (!malePeopleObj_father[father.personid]) return;
            var sons = malePeopleObj_father[father.personid];
            _.each(sons, function(son) {
                son.generation = depth + 1
                trackDown(son, son.generation)
            })
        }

        var man = _.filter(malePeople, function(d) {
            return d.generation === 0;
        })
        var currentGen = 0;
        _.each(man, function(p) {
            trackDown(p, currentGen);
        })

    };

    ret.processSelection = function(selectionObj) {
        var query = {};
        _.each(selectionObj, function(val, key) {
            if (val[0] !== val[1]) {
                query[key] = val;
            }
        })
        return query;
    };

    ret.assignCluster = function(malePeople, clusters) {
        var otherOrder = -1;
        _.each(clusters, function(c) {
            if (typeof c.description === 'string')
                otherOrder = c.order;
        })

        for (var i = 0, len = malePeople.length; i < len; i++) {
            var p = malePeople[i];
            p.cluster = otherOrder;
        }
        _.each(clusters, function(cluster) {
            for (var i = 0, len = malePeople.length; i < len; i++) {
                var p = malePeople[i];

                var flag = true;
                _.each(cluster.description, function(val, key) {
                    var flagTemp = (p[key] >= val[0] && p[key] < val[1])
                    flag = flag && flagTemp;
                })

                if (flag) {
                    p.cluster = cluster.order;
                }
            }
        })
    };

    ret.clearCluster = function(malePeople) {
        for (var i = malePeople.length - 1; i >= 0; i--) {
            malePeople[i].cluster = 0;
        }
    }

    ret.getTickValues = function(axis) {
        var ticks = axis.tickValues();
        return ticks.slice(0);
    }


    return ret;
}();

Template.clusterWindow.dataProcessor = function() {
    var ret = {
        version: 0.1,
    }

    function getDist(a, b) {
        return Math.abs(a - b);
    }

    ret.getClusterData = function(obj) {
        var ret = [];
        _.each(obj, function(vals, key) {
            if (vals.length < 3) return;

            vals.sort(function(a, b) {
                return a - b;
            })
            var temp = { name: key, value: [] };
            for (var i = 0; i < vals.length - 1; i++) {
                var current = vals[i],
                    next = vals[i + 1];
                temp.value.push([current, next]);
            }

            ret.push(temp);
        })

        return ret[0];
    };

    ret.applyFilter = function(data, filter, svgStr) {

        var filteredData = [];
        if (filter && filter.length) {
            for (var i = 0, len = data.length; i < len; i++) {
                var p = data[i]
                var flag = true;

                _.each(filter, function(fil) {
                    var flagTemp;
                    if (fil.constructor === Array) {
                        flagTemp = (p[svgStr] >= fil[0] && p[svgStr] < fil[1])
                    } else {
                        flagTemp = p[svgStr] !== fil;
                    }
                    flag = flag && flagTemp;
                })

                if (flag) filteredData.push(p);
            }
        } else {
            filteredData = data.slice(0);
        }

        return filteredData;

    }

    ret.formatClusters=function(permutationResult){
        var ret=[{order:-1, description:'others'}];
        if(permutationResult.length==0){
            ret[0].description='all';
            return ret;
        }
        _.each(permutationResult, function(r){
            var temp={order:0, description:{}};
            _.each(r, function(c){
                temp.description[c.name]=c.range;
            })
            ret.push(temp);
        })
        _.each(ret, function(c, i){
            c.order=i;
        })
        return ret;
    }


    return ret;
}();
