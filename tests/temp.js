var fs=require('fs')

var nodes=require('../public/sankeyNodes.json');
var edges=require('../public/sankeyEdges.json');

var graph={
	"nodes":nodes,
	"edges":edges
}

fs.writeFileSync('../public/sankeyData.json', JSON.stringify(graph))
