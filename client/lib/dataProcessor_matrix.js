Template.matrix.dataProcessor = function() {
    var ret = {
        version: 0.1,
    };
    var self = this;

    var conf_flow = Template.flow.configure;
    var conf = Template.matrix.configure;

    ret.getMatrixData = function(roots) {
        var ret = { children: [], label: '0' };
        var father2children = conf_flow.malePeopleObj_father_toUse;
        var personObj = conf_flow.malePeopleObj_toUse;

        function recursion(roots, gen, birthOrder, parent, idx) {
            let children = []
            _.each(roots, root => children.push(...father2children[root.personid]));
            let children_birthorder = d3.nest()
                .key(d => d.birthOrderFix)
                .sortKeys((a, b) => (+a) - (+b))
                .entries(children);

            let temp = { gen, birthOrder, children: [], label: parent.label + idx };
            parent.children.push(temp);

            _.each(children_birthorder, (order, idx) => {
                recursion(order.values, gen + 1, order.key, temp, idx);
            })

        }

        recursion(roots, 0, 0, ret);

        return ret;
    }

    function divideGroup_byInc(node) {
        var trees = node.trees;
        var subgroup = {
            g: [],
            e: [],
            l: [],
        }
        _.each(trees, tree => {
            var obj = seq2tree(tree.pattern);
            tree.lean = calLean(obj)
            if (tree.lean > 0) subgroup.g.push(tree);
            else if (tree.lean === 0) subgroup.e.push(tree);
            else subgroup.l.push(tree);
        })

        var ret = [];
        _.each(subgroup, (trees, key) => {
            var name = key === 'g' ? 'greater than 0' : key === 'e' ? 'equal to 0' : 'less than 0';
            var idx = key === 'g' ? 0 : key === 'e' ? 1 : 2;
            var people = []
            _.each(trees, tree => {
                people.push(...tree.personids);
            })

            ret.push({
                name,
                people,
                trees,
                idx
            })
        })
        ret = _.filter(ret, r => r.people.length > 0);

        return ret;

    }

    function divideGroup_byFreq(node) {
        var trees = node.trees.sort((a, b) => {
            return b.personids.length - a.personids.length;
        });

        var sumPeople = node.people.length;
        var subgroup = [],
            temp = [],
            tempSum = 0,
            tempPeople = [];
        _.each(trees, (tree, i) => {
            tempSum += tree.personids.length;
            temp.push(tree);
            tempPeople.push(...tree.personids);

            if (tempSum > sumPeople / 3) {
                subgroup.push({
                    people: tempPeople,
                    trees: temp,
                })
                temp = [];
                tempSum = 0;
                tempPeople = [];
            }
            if (i === trees.length - 1) {
                subgroup.push({
                    people: tempPeople,
                    trees: temp,
                })
            }
        })
        _.each(subgroup, (group, i) => {
            group.name = `freq${i}`;
            group.idx = i;
        })

        console.log(subgroup)
        return subgroup;
    }

    ret.divideGroup = function(node, groupMethod) {
        if (groupMethod === 'inclination')
            return divideGroup_byInc(node);
        else if (groupMethod === 'frequency')
            return divideGroup_byFreq(node);
    }

    ret.getTreemapData = function(trees, rect, attr) {
        var arr = _.map(trees, tree => {
            return {
                count: tree.count,
                lean: tree.lean,
                population: tree.pattern.length,
                pattern:tree.pattern
            }
        }).sort((a, b) => {
            if(a[attr]===b[attr])
                return b.freq-a.freq;
            return a[attr] - b[attr];
        });

        var small_rects = d3.treemap_algo(arr, rect)

        return small_rects;
    }

    ret.reformatR = function(attrs) {
        var ret = []
        _.each(attrs, function(attr) {
            var oneAttr = {};
            oneAttr.attr = attr.attr[0];
            oneAttr.x = _.filter(_.map(attr.x, x => x[oneAttr.attr]), d => d <= 70)
                //initial marginY
            oneAttr.marginY = [];
            //initial prob
            var probs = ['prob', 'probLower', 'probUpper']
            _.each(probs, prob => oneAttr[prob] = [])

            _.each(attr.ylevel, function(ylevel, idx) {
                //margin
                var temp = {}
                var trees = conf_flow.involvedNodes.filter(node => node.name === ylevel)[0].trees;
                temp.group = ylevel;
                temp.path = _.map(trees, tree => tree.pattern.sort());
                temp.data = []
                _.each(attr.margin[idx], function(d, i) {
                    var x = oneAttr.x[i];
                    if (x < 70) {
                        temp.data.push({
                            x: x,
                            y: d
                        })
                    }
                })
                oneAttr.marginY.push(temp);

                //deal with prob
                _.each(probs, prob => {
                    var probTemp = { data: [], path: temp.path };
                    _.each(attr[prob], (p, i) => {
                        var x = oneAttr.x[i];
                        if (x < 70) {
                            probTemp.data.push({
                                x: x,
                                y: p[idx],
                            })
                        }
                    })
                    oneAttr[prob].push(probTemp);
                })

            })
            ret.push(oneAttr);
        })
        console.log(ret)

        return ret;
    }

    function formatProb(arr, path, oneAttr) {
        var temp = { data: [], path: path };
        _.each(arr, (p, i) => {
            var x = oneAttr.x[i];
            if (x < 70) {
                temp.data.push({
                    x: x,
                    y: p[idx],
                })
            }
        })
        return temp;
    }

    ret.formatRegressionData = function(groups, attrs) {
        var ret = [];
        _.each(groups, group => {
            if (group.draw === 'no') return;

            _.each(group.people, man => {
                var ori = conf_flow.malePeopleObj_toUse[man]
                var temp = {}
                temp.group = group.name;
                temp.birthyear = ori.birthyear;
                _.each(attrs, attr => {
                    if (attr === 'sonCountFix')
                        temp[attr] = Math.min(ori[attr], 10)
                    else temp[attr] = ori[attr]
                })
                ret.push(temp);
            })
        })
        return ret;
    }

    ret.calDistance = function(a, b) {
        var arrA = a.split(',')
        var arrB = b.split(',')
        var flag1 = Math.abs(arrA.length - arrB.length) === 1;
        var flag2 = _.intersection(arrA, arrB).length === Math.min(arrA.length, arrB.length);
        if (flag2 && flag1) return 1;
        else return 0;
    }

    var calLean = function(tree) {

        function getDesCount(root) {
            var total = 0;

            function walk(root) {
                if (root.children) {
                    total += root.children.length;
                }
                _.each(root.children, child => {
                    getDesCount(child);
                })
            }
            walk(root);
            root.nDes = total + 1;
        }

        function getAllDesCount(root) {
            getDesCount(root);
            _.each(root.children, child => {
                getAllDesCount(child);
            })
        }
        getAllDesCount(tree);

        var left = 0,
            right = 0;

        function trackDown(root) {
            if (!root.children || root.children.length == 0) return;
            else if (root.children.length === 1) {
                trackDown(root.children[0])
                return;
            }

            let mid = Math.floor(root.children.length / 2);
            if (root.children.length % 2 === 0) {
                _.each(root.children, (child, i) => {
                    if (i < mid) left += child.nDes;
                    else right += child.nDes;
                })
            } else {
                _.each(root.children, (child, i) => {
                    if (i < mid) left += child.nDes;
                    else if (i > mid) right += child.nDes;
                })
                trackDown(root.children[mid]);
            }
        }
        trackDown(tree);
        if (left === right) return 0;
        return (left - right) / (left + right);
    }
    ret.calLean = calLean;

    ret.generateFakeTree = function(nGen, children, length) {
        var ret = { children: [], label: '0', gen: 0 };
        var gen = 0;

        function appendChild(parent) {
            if (parent.gen < nGen) {
                for (let i = 0; i < children.length + 1; i++) {
                    parent.children.push({ children: [], label: parent.label + i, gen: parent.gen + 1 });
                }
                _.each(parent.children, child => {
                    appendChild(child);
                })
            }
        }

        appendChild(ret);
        return ret;

    };

    var seq2tree = function(seq) {
        var ret = { label: '0', children: [] };
        seq = seq.sort();
        var flag = true;
        if (seq[0] !== '0') return {};

        for (var i = 1; i < seq.length; i++) {
            var item = seq[i];
            var elems = item.split('g');
            elems.shift();
            flag = walk(elems, ret);
            if (flag) continue;
            else return {};
        }
        return ret;

        function walk(items, obj) {
            if (items.length < 1)
                return true;

            var first = +items.shift();
            if (obj.children) {
                if (obj.children.length === first) {
                    obj.children.push({
                        label: obj.label + 'g' + first,
                        children: [],
                    })
                    return walk(items, obj.children[first]);
                } else if (obj.children.length < first) {
                    return false;
                } else {
                    return walk(items, obj.children[first])
                }
            }
            return false;
        }
    };
    ret.seq2tree = seq2tree;

    ret.getMatrixData_attr = function(attrs, trees) {
        var ret = []
        _.each(attrs, attr => {
            _.each(trees, tree => {
                ret.push({
                    tree: this.seq2tree(tree.pattern.split(',')),
                    path: tree.pattern,
                    attr: attr,
                    freqArr: this.getFreq(tree.ids, attr)
                })
            })
        })
        return ret;
    }

    ret.getFreq = function(ids, attr) {
        var arr = _.map(ids, id => conf_flow.malePeopleObj_toUse['' + id][attr]);

        var range = conf.attrConf[attr].range;
        var temp = _.groupBy(arr, d => d);
        var ret = [];
        for (var i = range[0]; i <= range[1]; i++) {
            if (temp['' + i])
                ret.push({
                    x: i,
                    y: temp['' + i].length,
                })
            else ret.push({ x: i, y: 0 });
        }
        return ret;
    }

    return ret;
}();
