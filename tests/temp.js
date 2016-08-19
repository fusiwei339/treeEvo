var fs = require('fs')

var nodes = require('../public/sankeyNodes.json');
var edges = require('../public/sankeyEdges.json');

var graph = {
    "nodes": nodes,
    "edges": edges
}

fs.writeFileSync('../public/sankeyData.json', JSON.stringify(graph))


ret.getTreemapData = function(nodes, treemapConf) {
    var levels = _.groupBy(nodes, function(d) {
        return d.model_level;
    })
    var arr = _.map(levels, function(d) {
        return d.length;
    })
    var areas = d3.treemap_algo(arr, treemapConf)
    var ret = []
    for (var level in levels) {
        var oneLevel = levels[level];
        for (var j = 0; j < areas.length; j++) {
            if (oneLevel.length === areas[j].text) {
                ret.push({
                    rect: areas[j].rect,
                    weight: areas[j].text,
                    node: oneLevel,
                    level: level,
                })
            }
        }
    }
    return ret;
};
