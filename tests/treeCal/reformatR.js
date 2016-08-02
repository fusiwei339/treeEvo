var attrs = db.r.find().toArray()
var ret = []
_.each(attrs, function(attr) {
    var oneAttr = {};
    oneAttr.attr = attr.attr[0];
    oneAttr.x = _.map(attr.x, function(x) {
        if(x[oneAttr.attr]<=70){
            return x[oneAttr.attr];
        }
    })
    oneAttr.marginY = [];
    _.each(attr.ylevel, function(ylevel, idx) {
        var temp = {}
        temp.group = ylevel;
        temp.path = db.statData.findOne({ group: +ylevel }).pattern;
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
    })
    ret.push(oneAttr);
})
db.rPretty.drop();
db.rPretty.insert(ret);
