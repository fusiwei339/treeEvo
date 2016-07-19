d3.drawMatrix = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    // draw() {
    //     this.drawRect();
    //     this.drawTrees():
    // }

    draw() {

        var data = this.data;
        var svg = this.svg;
        var patternPart=30;

        var rectCanvas=svg.append('g')
            .attr('class', 'rectCanvas')
            .attr('transform', d3.translate(patternPart, 0))
        var patternCanvas=svg.append('g')
            .attr('class', 'patternCanvas')
            .attr('transform', d3.translate(0, 0))

        _.each(data, d => {
            d.values = d.values.sort((a, b) => b.freq - a.freq)
            d.values = d.values.slice(0, 15);
        })

        //draw rect
        var xScale = d3.scale.ordinal()
            .domain(_.map(data, d => d.key))
            .rangeBands([patternPart, $(svg[0]).width()])

        var yDomain = _.union(..._.map(data, d => {
            return _.map(d.values, e => e.path)
        }))
        var yScale = d3.scale.ordinal()
            .domain(yDomain)
            .rangeBands([0, $(svg[0]).height()])

        var colorDomain = _.union(..._.map(data, d => {
            return _.map(d.values, e => e.freq / e.dbSize)
        }))
        var colorScale = d3.scale.linear()
            .domain([0, d3.max(colorDomain)])
            .range(['white', '#54278f'])

        rectCanvas.selectAll('.matrixRow')
            .data(data).enter()
            .append('g').attr('class', 'matrixRow')
            .selectAll('.matrixCell')
            .data(d => d.values).enter()
            .append('rect')
            .attr({
                class: 'matrixCell',
                width: xScale.rangeBand(),
                height: yScale.rangeBand(),
            })
            .attr('x', d => xScale(d.clusterRange))
            .attr('y', d => yScale(d.path))
            .attr('fill', d => colorScale(d.freq / d.dbSize))

        //draw trees
        var treeMap = {};
        _.each(data, col => {
            _.each(col.values, pattern => {
                treeMap[pattern.path] = pattern.tree;
            })
        })

        patternCanvas.selectAll('.patternTree')
            .data(yDomain).enter()
            .append('g').attr('class', 'patternTree')
            .attr('transform', d=>d3.translate(0, yScale(d)))
            .each(function(d, i){
                var canvas=d3.select(this);
                var data=treeMap[d]
                var yMargin=5;
                new d3.drawTree(canvas, data)
                    .height(yScale.rangeBand()-yMargin*2)
                    .width(50)
                    .draw()
            })

    }

}
