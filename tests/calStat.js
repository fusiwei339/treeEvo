var attrConf = {
    lastage: {
        range: [0, 100]
    },
    f_bir_age: {
        range: [0, 100]
    },
    l_bir_age: {
        range: [0, 100]
    },
    birthyear: {
        range: [1675, 1909]
    },
};

var getFreq = function(people, attr) {
    var arr = _.map(people, p => p[attr]);

    var range = attrConf[attr].range;
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

var ret={}
for (var key in attrConf) {
    var people = db.trees_complex.find().toArray();
    var arr = getFreq(people, key);
    ret[key]=arr;
}

db.stat.drop()
db.stat.insert(ret)