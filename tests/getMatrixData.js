function sortObj(obj){
	var arr=[];
	_.each(obj, function(val, key){
		arr.push([val, key])
	})
	arr.sort(function(a, b){
		return a[0].length-b[0].length;
	})
	var ret={}
	_.each(arr, function(elem, idx){
		if(idx<5){
			ret[elem[1]]=elem[0];
		}
	})
	return ret;
}
var depths = [1, 2, 3, 4, 5];
var ret=[]
_.each(depths, function(depth) {
	var query={};
	var key='depth'+depth;
	query[key]={$exists:true};
    var ids = db.trees_complex.find(query).toArray()
    var patterns=_.map(ids, function(id){
    	return {
    		personid:id.personid,
    		pattern:id[key].join(),
    	};
    })
    patterns=_.groupBy(patterns, function(pattern){
    	return pattern.pattern;
    });

    _.each(patterns, function(val, key){
    	ret.push({
    		freq:val.length/ids.length,
    		ids:_.map(val, function(v){return v.personid}),
    		pattern:key,
    		depth:depth,
    		// ids:_.map(val, function(v){return v.personid})
    	})
    })
})
db.trimed.drop();
db.trimed.insert(ret)