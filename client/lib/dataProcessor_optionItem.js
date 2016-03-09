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
                };
            case 'birthyear':
                return {
                    isConti: true,
                    svgStr: attr,
                    // range: xDomain,
                };
            case 'lastage':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                };
            case 'f_bir_age':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                    filter: " ",
                };
            case 'l_bir_age':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                    filter: " ",
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
        var malePeopleObj = {},
            malePeopleObj_father = {};

        _.each(malePeople, function(male) {
            malePeopleObj[male.personid] = male;
        });
        malePeopleObj_father = _.groupBy(malePeople, function(male) {
            return male.fatherid;
        });

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

    }


    return ret;
}();
