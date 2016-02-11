d3.drawSankey = class {

    constructor(svg, graph, sankey) {
        this.svg = svg;
        this.graph = graph;
        this.sankey = sankey;
    }

    draw() {
            console.log('start to draw')
        // add in the nodes
        var conf = Template.lineage.configure;
        var animationDur=conf.animationDur;
        var path = this.sankey.link();
        var colorDomain = _.uniq(_.map(this.graph.nodes, function(node) {
            return node.cluster;
        }))
        var color = d3.scale.ordinal()
            .domain(colorDomain)
            .range(['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6','#ffffcc','#e5d8bd','#fddaec','#f2f2f2'])
        conf.colorScale=color;

        var nodeSelection = this.svg.selectAll(".node")
            .data(this.graph.nodes)

        nodeSelection.transition()
            .duration(animationDur)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .select('rect')
            .attr("height", function(d) {
                return d.dy;
            })

        nodeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()
        nodeSelection.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on('click', function(d){
                Session.set('nodeSelected', {
                    generation:d.generation,
                    cluster:d.cluster,
                    man:d.man,
                });
            })
            .on('mouseover', function(d){
                Session.set('nodeHovered', {
                    generation:d.generation,
                    cluster:d.cluster,
                    man:d.man,
                });
            })
            .append("rect")
            .attr('class', 'flowBar')
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", this.sankey.nodeWidth())
            .style("fill", function(d) {
                return color(d.cluster);
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2);
            })

        var linkSelection = this.svg.selectAll(".link")
            .data(_.filter(this.graph.links, function(link) {
                return link.sourcePart > 0;
            }))

        linkSelection.enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr('title', function(d) {
                return d.source.name + '--' + d.target.name + '--' + d.value;
            })
        linkSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()
        linkSelection.transition()
            .duration(animationDur)
            .attr("d", path)

    }
}
