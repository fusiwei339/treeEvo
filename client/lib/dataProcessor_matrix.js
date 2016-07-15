Template.matrix.dataProcessor = function() {
    var ret = {
        version: 0.1,
    }

    var conf_flow = Template.flow.configure;

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

    ret.generateFakeTree = function(nGen, nSons) {
        var ret = { children: [], label: '0', gen: 0 };
        var gen = 0;

        function appendChild(parent) {
            if (parent.gen < nGen) {
                for (let i = 0; i < nSons+1; i++) {
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
