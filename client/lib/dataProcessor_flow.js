Template.flow.dataProcessor = function() {
    var ret = {
        version: 0.1
    };

    var conf = Template.flow.configure;
    ret.getSankeyGraph = function(nodes, edges) {
        var nodeObj = {}
        _.each(nodes, function(node, i) {
            nodeObj[node.name] = i;
        })
        _.each(edges, function(edge) {
            edge.source = nodeObj[edge.source];
            edge.target = nodeObj[edge.target];
        })
        return {
            nodes: nodes,
            links: _.filter(edges, function(link) {
                return link.sourcePart > 0;
            }),
        };
    };

    ret.calBasicInfo = function(nodes, edges) {
        var max_generation = d3.max(nodes, function(node) {
            return node.generation;
        })
        var clusters = _.uniq(_.map(nodes, function(node) {
            return node.cluster;
        }))
        conf.edgeObj = {}
        _.each(edges, function(edge) {
            conf.edgeObj[edge.source + edge.target] = edge;
        })
        conf.max_generation = max_generation;
        conf.clusters = clusters;
    }

    ret.getScaleFunc = function(mode) {
        switch (mode) {
            case 'scaleBySqrt':
                return function(node) {
                    node.value1 = Math.sqrt(node.man.length);
                    node.value2 = Math.sqrt(node.children.length);
                };
            case 'scaleByUni':
                return function(node) {
                    node.value1 = 1;
                    node.value2 = 1;
                };
            case 'scaleByDefault':
                return function(node) {
                    node.value1 = node.man.length;
                    node.value2 = node.children.length;
                }
        }
    };

    ret.getStatData = function(stat) {
        var ret = [];
        var barTypes = ['f_mar_age', 'f_bir_age', 'l_bir_age', 'lastage', 'SON_COUNT'];

        _.each(barTypes, function(key) {
            if (stat[key].mean === 0) return;
            var temp = {}
            temp.name = key;
            temp.mean = stat[key].mean;
            temp.std = stat[key].std;
            ret.push(temp);

        })
        return ret;
    };

    // var nodesByGen_decendent = function(node) {
    //     var currentGen = node.generation;
    //     var maxGen = conf.max_generation;

    //     //get nodes by generation
    //     var nodesByGen = [];
    //     var initFatherArr = _.map(node.man, function(man) {
    //         return conf.malePeopleObj['' + man];
    //     })
    //     var fatherArr = initFatherArr;
    //     for (var i = currentGen + 1; i <= maxGen; i++) {
    //         var temp = {
    //             generation: i,
    //             man: [],
    //         };
    //         _.each(fatherArr, function(father) {
    //             temp.man.push(...conf.malePeopleObj_father['' + father.personid])
    //         })
    //         nodesByGen.push(temp);
    //         fatherArr = temp.man;
    //     }

    //     return nodesByGen;
    // }

    // var nodesByGen_ancient_current = function(node) {
    //     var currentGen = node.generation;
    //     var nodesByGen = [];
    //     var childArr = _.map(node.man, function(child) {
    //         return conf.malePeopleObj['' + child];
    //     });

    //     //current
    //     nodesByGen.push({
    //         generation: currentGen,
    //         man: childArr,
    //     })

    //     //ancient
    //     for (var i = currentGen - 1; i >= 0; i--) {
    //         var temp = {
    //             generation: i,
    //         }
    //         var fatherids = _.uniq(_.map(childArr, function(child) {
    //             return child.fatherid;
    //         }))
    //         var fatherArr = _.map(fatherids, function(father) {
    //             return conf.malePeopleObj['' + father];
    //         })
    //         temp.man = fatherArr;
    //         nodesByGen.push(temp);

    //         childArr = fatherArr;
    //     }

    //     return nodesByGen;
    // }

    function getNextGen(man) {
        var nextGen = []
        for (var i = 0, len = man.length; i < len; i++) {
            var father = man[i];
            var children = conf.malePeopleObj_father_toUse[father.personid];
            nextGen.push(...children);
        }
        return nextGen;
    }
    // var getSankeyNodes = function(node) {

    //     var nodesByGen = [];
    //     nodesByGen.push(...nodesByGen_decendent(node))
    //     nodesByGen.push(...nodesByGen_ancient_current(node))

    //     //get nodes
    //     var nodes = []
    //     _.each(nodesByGen, function(gen) {
    //         var clusters = d3.nest()
    //             .key(function(d) {
    //                 return d.cluster;
    //             })
    //             .entries(gen.man);
    //         _.each(clusters, function(cluster) {
    //             nodes.push({
    //                 generation: gen.generation,
    //                 cluster: cluster.key,
    //                 man: cluster.values,
    //                 children: getNextGen(cluster.values),
    //                 name: 'gen' + gen.generation + 'cluster' + cluster.key,
    //             })
    //         })
    //     })
    //     return nodes;
    // };

    // var getNodeConnections = function(nodes) {
    //     var nodesByGen = _.groupBy(nodes, function(node) {
    //         return node.generation;
    //     })
    //     var generations = _.keys(nodesByGen).sort(function(a, b) {
    //         return +a - (+b);
    //     })

    //     var getEdge = function(fatherNode, sonNode) {
    //         var fatherArr = fatherNode.man;
    //         var sonArr = sonNode.man;
    //         var edge = {
    //             source: fatherNode.name,
    //             target: sonNode.name
    //         }
    //         var peopleArr = []
    //         var possibleSons = {}
    //         _.each(fatherArr, function(father) {
    //             var possibleSonsTemp = conf.malePeopleObj_father[father.personid];
    //             _.each(possibleSonsTemp, function(temp) {
    //                 possibleSons[temp.personid] = temp;
    //             })
    //         })
    //         _.each(sonArr, function(son) {
    //             var oneMatch = possibleSons[son.personid];
    //             if (oneMatch) peopleArr.push(oneMatch);
    //         })

    //         var personids = _.map(peopleArr, function(d) {
    //             return d.personid;
    //         });
    //         edge.sourceVal = personids;
    //         edge.targetVal = personids;

    //         if (!edge.sourceVal.length) return null;
    //         return edge;
    //     }

    //     var edges = []
    //     for (var i = 1; i < generations.length; i++) {
    //         var fatherNodes = nodesByGen[generations[i - 1]];
    //         var sonNodes = nodesByGen[generations[i]];
    //         _.each(fatherNodes, function(fatherNode) {
    //             _.each(sonNodes, function(sonNode) {
    //                 var edge = getEdge(fatherNode, sonNode);
    //                 if (edge) edges.push(edge);
    //             })
    //         })
    //     }

    //     return edges;

    // }

    // ret.matchNodes = function(highlightNodes, nodes) {
    //     var nodesObj = {}
    //     var attrs = ['x', 'y', 'dx', 'dy1', 'dy2']
    //     _.each(nodes, function(node) {
    //         nodesObj[node.name] = node;
    //     })
    //     _.each(highlightNodes, function(node) {
    //         var node_ori = nodesObj[node.name];
    //         _.each(attrs, function(attr) {
    //             node[attr] = node_ori[attr];
    //         })
    //         node.dy1 = node.dy1 * node.man.length / node_ori.man.length;
    //         node.dy2 = node_ori.children.length ? node.dy2 * node.children.length / node_ori.children.length : node.dy1;
    //         node.y = node_ori.y;
    //         node.color = node_ori.shadeColor;
    //     })
    //     return highlightNodes;
    // }

    // ret.matchEdges = function(highlightEdges, edges) {
    //     var edgesObj = {};
    //     var attrs = ['sourcedy', 'sy', 'targetdy', 'ty'];
    //     _.each(edges, function(edge) {
    //         edgesObj[edge.source.name + edge.target.name] = edge;
    //     })
    //     _.each(highlightEdges, function(edge) {
    //         var edge_ori = edgesObj[edge.source + edge.target];
    //         _.each(attrs, function(attr) {
    //             edge[attr] = edge_ori[attr];
    //         })
    //         edge.sourcedy = edge.sourcedy * edge.sourceVal.length / edge_ori.sourceVal.length;
    //         edge.targetdy = edge.targetdy * edge.targetVal.length / edge_ori.targetVal.length;
    //     })
    //     return highlightEdges;

    // }

    // function computeNodeLinks(links) {
    //     var nodesObj = {};
    //     var nodes = conf.sankeyNodes;
    //     nodes.forEach(function(node) {
    //         nodesObj[node.name] = node;
    //     });
    //     links.forEach(function(link) {
    //         link.source = nodesObj[link.source];
    //         link.target = nodesObj[link.target];
    //     });
    // }

    // ret.getHighlightSankeyGraph = function(node) {
    //     var nodes = getSankeyNodes(node);
    //     var links = getNodeConnections(nodes);

    //     nodes = this.matchNodes(nodes, conf.sankeyNodes);
    //     links = this.matchEdges(links, conf.sankeyEdges);
    //     computeNodeLinks(links);
    //     return {
    //         nodes: nodes,
    //         links: links
    //     };
    // };

    function mapIds(arr) {
        return _.map(arr, function(d) {
            return d.personid;
        })
    }

    function getSankeyGraph_node_allPeople(malePeople) {
        var nodes = [];
        var groupByGen = d3.nest()
            .key(function(d) {
                return d.generation;
            })
            .entries(malePeople);

        _.each(groupByGen, function(generation) {
            var man = generation.values;
            var clusters = d3.nest()
                .key(function(d) {
                    return d.cluster;
                })
                .entries(man);
            _.each(clusters, function(cluster) {
                nodes.push({
                    generation: generation.key,
                    cluster: cluster.key,
                    man: mapIds(cluster.values),
                    children: mapIds(getNextGen(cluster.values)),
                    name: 'gen' + generation.key + 'cluster' + cluster.key,
                })
            })
        })
        return nodes;
    }

    function getSankeyGraph_edge_allPeople(nodes) {
        var nodesByGen = _.groupBy(nodes, function(node) {
            return node.generation;
        })
        var generations = _.keys(nodesByGen).sort(function(a, b) {
            return +a - (+b);
        })

        var getEdge = function(fatherNode, sonNode) {
            var fatherArr = fatherNode.man;
            var sonArr = sonNode.man;
            var edge = {
                source: fatherNode.name,
                target: sonNode.name
            }
            var peopleArr = []
            var possibleSons = {}
            _.each(fatherArr, function(father) {
                var possibleSonsTemp = conf.malePeopleObj_father_toUse[father];
                _.each(possibleSonsTemp, function(temp) {
                    possibleSons[temp.personid] = temp;
                })
            })
            _.each(sonArr, function(son) {
                var oneMatch = possibleSons[son];
                if (oneMatch) peopleArr.push(oneMatch);
            })

            edge.sourceVal = mapIds(peopleArr);
            edge.targetVal = edge.sourceVal;
            edge.sourcePart = edge.sourceVal.length / fatherNode.children.length;
            edge.targetPart = edge.targetVal.length / sonNode.man.length;

            if (!edge.sourceVal.length) return null;
            return edge;
        }

        var edges = []
        for (var i = 1; i < generations.length; i++) {
            var fatherNodes = nodesByGen[generations[i - 1]];
            var sonNodes = nodesByGen[generations[i]];
            _.each(fatherNodes, function(fatherNode) {
                _.each(sonNodes, function(sonNode) {
                    var edge = getEdge(fatherNode, sonNode);
                    if (edge) edges.push(edge);
                })
            })
        }

        return edges;
    }


    ret.getSankeyGraph_allPeople = function(malePeople) {
        var nodes = getSankeyGraph_node_allPeople(malePeople);
        var edges = getSankeyGraph_edge_allPeople(nodes);
        return { nodes: nodes, links: edges };
    }

    return ret;
}();
