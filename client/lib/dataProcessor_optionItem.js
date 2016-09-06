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

    ret.getGraidentData = function(trees, attr) {
        var data_temp = _.map(trees, t => {
            var ret = { count: t.count }
            if (attr === 'population') {
                ret.key = t.pattern.length;
            } else {
                ret.key = t[attr];
            }
            return ret;
        })

        data_temp.sort((a, b) => {
            if (attr === 'lean')
                return b.key - a.key
            return a.key - b.key
        })

        var graidentData = [];
        _.each(data_temp, t => {
            for (let i = 0; i < t.count; i++, graidentData.push(t.key));
        })
        var samplePoints = _.range(0, 1, .01);
        var ret = _.map(samplePoints, p => {
            return {
                offset: p,
                value: graidentData[Math.floor(p * graidentData.length)]
            }
        })
        return ret;
    }

    ret.sankeyEdges = function(nodes) {
        var nodesByDepth = _.groupBy(nodes, function(node) {
            return node.depth;
        })
        var depths = _.keys(nodesByDepth).sort(function(a, b) {
            return +a - (+b);
        })

        function intersect_safe(a, b) {
            var ai = 0,
                bi = 0;
            var result = [];

            while (ai < a.length && bi < b.length) {
                if (a[ai] < b[bi]) { ai++; } else if (a[ai] > b[bi]) { bi++; } else /* they're equal */ {
                    result.push(a[ai]);
                    ai++;
                    bi++;
                }
            }

            return result;
        }

        var getEdge = function(fatherNode, sonNode) {
            var fatherArr = fatherNode.trees;
            var sonArr = sonNode.trees;
            var edge = {
                source: fatherNode.name,
                target: sonNode.name
            }
            var source = [],
                target = [];
            fatherNode.people.sort((a, b) => a - b)
            sonNode.people.sort((a, b) => a - b)
            var intersection = intersect_safe(fatherNode.people, sonNode.people)

            edge.sourceVal = intersection;
            edge.targetVal = intersection;
            edge.sourcePart = edge.sourceVal.length / fatherNode.people.length;
            edge.targetPart = edge.targetVal.length / sonNode.people.length;

            if (!intersection.length) return null;
            return edge;
        }

        var edges = []
        for (var i = 1; i < depths.length; i++) {
            var fatherNodes = nodesByDepth[depths[i - 1]];
            var sonNodes = nodesByDepth[depths[i]];
            _.each(fatherNodes, function(fatherNode) {
                if (fatherNode.cluster === 'cutoff')
                    return;
                _.each(sonNodes, function(sonNode) {
                    var edge = getEdge(fatherNode, sonNode);
                    if (edge) edges.push(edge);
                })
            })
        }

        return edges;
    }

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

    ret.getClusters = function(obj) {
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

    ret.getClusterData = function(clusters) {
        var ret = []
        var malePeople = Template.flow.configure.malePeople;

        _.each(clusters.value, range => {
            var filteredMale = _.filter(malePeople, male => {
                return male[clusters.name] >= range[0] && male[clusters.name] < range[1] && male.depth > 1;
            })
            var ids = _.map(filteredMale, male => male.personid);
            ret.push({
                name: clusters.name,
                range,
                ids,
            })
        })

        return ret;
    }

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

    ret.formatClusters = function(permutationResult) {
        var ret = [{ order: -1, description: 'others' }];
        if (permutationResult.length == 0) {
            ret[0].description = 'all';
            return ret;
        }
        _.each(permutationResult, function(r) {
            var temp = { order: 0, description: {} };
            _.each(r, function(c) {
                temp.description[c.name] = c.range;
            })
            ret.push(temp);
        })
        _.each(ret, function(c, i) {
            c.order = i;
        })
        return ret;
    }


    return ret;
}();
