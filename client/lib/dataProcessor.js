Template.lineage.dataProcessor = function() {
    var ret = {
        version: 0.1
    };

    var conf = Template.lineage.configure;
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
            return node.clusters;
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
            case 'sqrt':
                return function(node) {
                    node.value = Math.sqrt(node.man.length) * 100;
                };
            case 'uni':
                return function(node) {
                    node.value = 10000;
                };
            case 'linear':
                return function(node) {
                    node.value = node.man.length;
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

    var nodesByGen_decendent = function(node) {
        var currentGen = node.generation;
        var maxGen = conf.max_generation;

        //get nodes by generation
        var nodesByGen = [];
        var initFatherArr = _.map(node.man, function(man) {
            return conf.malePeopleObj_ori['' + man];
        })
        var fatherArr = initFatherArr;
        for (var i = currentGen + 1; i <= maxGen; i++) {
            var temp = {
                generation: i,
                man: [],
            };
            _.each(fatherArr, function(father) {
                temp.man.push(...conf.malePeopleObj_father['' + father.personid])
            })
            nodesByGen.push(temp);
            fatherArr = temp.man;
        }

        return nodesByGen;
    }

    var nodesByGen_ancient_current = function(node) {
        var currentGen = node.generation;
        var nodesByGen = [];
        var childArr = _.map(node.man, function(child) {
            return conf.malePeopleObj_ori['' + child];
        });

        //current
        nodesByGen.push({
            generation: currentGen,
            man: childArr,
        })

        //ancient
        for (var i = currentGen - 1; i >= 0; i--) {
            var temp = {
                generation: i,
            }
            var fatherids = _.uniq(_.map(childArr, function(child) {
                return child.fatherid;
            }))
            var fatherArr = _.map(fatherids, function(father) {
                return conf.malePeopleObj_ori['' + father];
            })
            temp.man = fatherArr;
            nodesByGen.push(temp);

            childArr = fatherArr;
        }

        return nodesByGen;
    }

    var getSankeyNodes = function(node) {

        var nodesByGen = [];
        nodesByGen.push(...nodesByGen_decendent(node))
        nodesByGen.push(...nodesByGen_ancient_current(node))

        //get nodes
        var nodes = []
        _.each(nodesByGen, function(gen) {
            var clusters = d3.nest()
                .key(function(d) {
                    return d.cluster;
                })
                .entries(gen.man);
            _.each(clusters, function(cluster) {
                nodes.push({
                    generation: gen.generation,
                    cluster: cluster.key,
                    man: cluster.values,
                    name: 'gen' + gen.generation + 'cluster' + cluster.key,
                })
            })
        })
        return nodes;
    };

    var getNodeConnections = function(nodes) {
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
                var possibleSonsTemp = conf.malePeopleObj_father[father.personid];
                _.each(possibleSonsTemp, function(temp) {
                    possibleSons[temp.personid] = temp;
                })
            })
            _.each(sonArr, function(son) {
                var oneMatch = possibleSons[son.personid];
                if (oneMatch) peopleArr.push(oneMatch);
            })

            var sourceVal = _.map(peopleArr, function(d) {
                return d.personid;
            });
            var targetVal = _.uniq(_.map(peopleArr, function(d) {
                return d.fatherid;
            }));
            edge.sourceVal = sourceVal;
            edge.targetVal = targetVal;

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

    var matchNodes = function(highlightNodes, nodes) {
        var nodesObj = {}
        var attrs = ['x', 'y', 'dx', 'dy']
        _.each(nodes, function(node) {
            nodesObj[node.name] = node;
        })
        _.each(highlightNodes, function(node) {
            var node_ori = nodesObj[node.name];
            _.each(attrs, function(attr) {
                node[attr] = node_ori[attr];
            })
            node.dy = node.dy * node.man.length / node_ori.man.length;
            node.y = node_ori.y + node_ori.dy - node.dy;
        })
        return highlightNodes;
    }

    var matchEdges = function(highlightEdges, edges) {
        var edgesObj = {};
        var attrs = ['sourcedy', 'sy', 'targetdy', 'ty'];
        _.each(edges, function(edge) {
            edgesObj[edge.source.name + edge.target.name] = edge;
        })
        _.each(highlightEdges, function(edge) {
            var edge_ori = edgesObj[edge.source + edge.target];
            _.each(attrs, function(attr) {
                edge[attr] = edge_ori[attr];
            })
            edge.sourcedy = edge.sourcedy * edge.sourceVal.length / edge_ori.sourceVal.length;
            edge.targetdy = edge.targetdy * edge.targetVal.length / edge_ori.targetVal.length;
        })
        return highlightEdges;

    }

    function computeNodeLinks(links) {
        var nodesObj = {};
        var nodes = conf.sankeyNodes;
        nodes.forEach(function(node) {
            nodesObj[node.name] = node;
        });
        links.forEach(function(link) {
            link.source = nodesObj[link.source];
            link.target = nodesObj[link.target];
        });
    }

    ret.getHighlightSankeyGraph = function(node) {
        var nodes = getSankeyNodes(node);
        var links = getNodeConnections(nodes);

        nodes = matchNodes(nodes, conf.sankeyNodes);
        links = matchEdges(links, conf.sankeyEdges);
        computeNodeLinks(links);
        return {
            nodes: nodes,
            links: links
        };
    }



    return ret;
}();
