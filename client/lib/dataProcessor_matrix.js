Template.matrix.dataProcessor = function() {
    var ret = {
        version: 0.1,
    }

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

    ret.calDistance = function(a, b) {
        var arrA = a.split(',')
        var arrB = b.split(',')
        var flag1 = Math.abs(arrA.length - arrB.length) === 1;
        var flag2 = _.intersection(arrA, arrB).length === Math.min(arrA.length, arrB.length);
        if (flag2 && flag1) return 1;
        else return 0;
    }

    ret.calLean = function(tree) {

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
        return (left - right) / Math.max(left, right);
    }

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

    }

    return ret;
}();
