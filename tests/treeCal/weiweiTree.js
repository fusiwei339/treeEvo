var nodes = db.patternsDepth.find().toArray()

var groupByDepth = d3.nest()
    .key(function(d) {
        return d.depth;
    })
    .entries(nodes);

_.each(groupByDepth, depth=>{
	depth.values.sort((a, b)=>b.count-a.count)
	var sumPopulation=d3.sum(depth.values, d=>d.count);
	var accu=0;

	_.each(depth.values, value=>{
		value.percent=value.count/sumPopulation;
		value.accu=accu;

		accu+=value.percent;
	})
})

db.patternsDepth_percent.drop();
db.patternsDepth_percent.insert(nodes)