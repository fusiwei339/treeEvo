Template.lineage.dataProcessor = function() {
    var ret = {
        version: 0.1
    };

    ret.getSankeyGraph=function(nodes, edges){
    	var nodeObj={}
    	_.each(nodes, function(node, i){
    		nodeObj[node.name]=i;
    	})
    	_.each(edges, function(edge){
    		edge.source=nodeObj[edge.source];
    		edge.target=nodeObj[edge.target];
    	})
    	return {
    		nodes:nodes,
    		links:edges,
    	};
    };

    ret.getScaleFunc=function(mode){
        switch (mode){
            case 'sqrt':
                return function(node){
                    node.value=Math.sqrt(node.man.length)*100;
                };
            case 'uni':
                return function(node){
                    node.value=10000;
                };
            case 'linear':
                return function(node){
                    node.value=node.man.length;
                }
        }
    };

    ret.getStatData=function(stat){
        var ret=[];
        for(var key in stat){
            var temp={}
            temp.name=key;
            temp.mean=stat[key].mean;
            temp.std=stat[key].std;
            ret.push(temp);
        }
        return ret;
    }



    return ret;
}();

