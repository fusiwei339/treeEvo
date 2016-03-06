var gens=db.sankeyNodes.distinct('generation')

gens=gens.sort(function(a, b){return a-b});

for(var i=0;i<gens.length;i++){
	var gen=gens[i];
	var clusters=db.sankeyNodes.find({generation:gen}).toArray();
	for(var j=0;j<clusters.length;j++){
		var man=clusters[j].man;
		db.malePeople.update({personid:{$in:man}}, {$set:{generation:gen}}, {multi:true});
	}
}