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
    }



    return ret;
}();

