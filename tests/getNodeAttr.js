var dealWithMissVal = function(val) {
    return val === "" ? 0 : +val;
}
db.sankeyNodes.find().forEach(function(node) {
    print(node.name)
    var people = db.malePeople.find({
        personid: {
            $in: node.man
        }
    }).toArray();

    var attrArr = ['f_mar_age', 'SON_COUNT', 'lastage', 'f_bir_age', 'l_bir_age'];

    var result = {name:node.name};

    _.each(attrArr, function(attr) {
        result[attr] = {
            valArr: []
        }
        _.each(people, function(d) {
            result[attr].valArr.push(dealWithMissVal(d[attr]));
        })
    })

    _.each(attrArr, function(attr) {
        var arr = result[attr].valArr;
        result[attr].mean = arr.length > 0 ? math.mean(arr) : 0;
        result[attr].std = arr.length > 0 ? math.std(arr) : 0;
        result[attr].valArr=[];
    })

    db.nodeStat.insert(result);

})
