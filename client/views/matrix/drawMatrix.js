d3.drawMatrix = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }
    patternPart(val) {
        this._patternPart = val;
        return this;
    }

    draw() {

        var conf = Template.matrix.configure;

        var data = this.data;
        var svg = this.svg;
        var animationDur = 500;
        var patternPart = this._patternPart;
        var circleR = conf.circleR;
        var totalWidth = $(svg[0]).width() / 2;

        var rectCanvas = svg.select('#rectCanvas')
        var patternCanvas = svg.select('#patternCanvas')

        //draw rect
        var xScale = d3.scale.ordinal()
            .domain(_.uniq(_.map(data, d => d.clusterRange)).sort())
            .rangeBands([conf.margin, totalWidth])

        var yScale = d3.scale.ordinal()
            .domain(_.uniq(_.map(data, d => d.path)))
            .rangeBands([0, $(svg[0]).height()])

        var colorDomain = _.map(data, d => d.freq / d.dbSize)
        var colorScale = d3.scale.linear()
            .domain([0, d3.max(colorDomain)])
            .range(['white', '#54278f'])

        var rectSelection = rectCanvas.selectAll('.matrixCell')
            .data(data, d => d.id = d.clusterRange + '-' + d.path)

        rectSelection.enter()
            .append('rect')
            .attr({
                class: 'matrixCell',
                width: xScale.rangeBand(),
                height: yScale.rangeBand(),
            })
            .attr('y', d => yScale(d.path))
            .attr('x', d => xScale(d.clusterRange))
            .attr('fill', d => colorScale(d.freq / d.dbSize))

        rectSelection.transition()
            .duration(animationDur)
            .attr({
                class: 'matrixCell',
                width: xScale.rangeBand(),
                height: yScale.rangeBand(),
            })
            .attr('y', d => yScale(d.path))
            .attr('x', d => xScale(d.clusterRange))
            .attr('fill', d => colorScale(d.freq / d.dbSize))

        rectSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()


        //draw trees
        var treeMap = {};
        _.each(data, pattern => {
            treeMap[pattern.path] = pattern.tree;
        })

        var patternTreeSelection = patternCanvas.selectAll('.patternTree')
            .data(yScale.domain(), (d, i) => {
                return d.id = i;
            })
        patternTreeSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()

        patternTreeSelection.enter()
            .append('g').attr('class', 'patternTree')
            .attr('transform', d => d3.translate(0, yScale(d) + conf.treePadding))
            .each(function(d, i) {
                var canvas = d3.select(this);
                let tree = treeMap[d]
                var yMargin = 5;
                canvas.append('rect')
                    .attr('class', 'background')
                    .attr({
                        width: patternPart,
                        height: yScale.rangeBand() - conf.treePadding * 2,
                        fill: '#ccc',
                        y: -conf.treePadding,
                    })
                new d3.drawTree(canvas, tree)
                    .height(yScale.rangeBand() - yMargin * 2)
                    .width(patternPart)
                    .draw()
            })

        patternTreeSelection.transition()
            .duration(animationDur)
            .attr('transform', d => d3.translate(0, yScale(d) + conf.treePadding))
            .each(function(d, i) {
                var canvas = d3.select(this);
                let tree = treeMap[d]
                var yMargin = 5;
                canvas.selectAll('.background')
                    .attr({
                        width: patternPart,
                        height: yScale.rangeBand() - 2 * conf.treePadding,
                        fill: '#ccc',
                        y: -conf.treePadding,
                    })
                new d3.drawTree(canvas, tree)
                    .height(yScale.rangeBand() - yMargin * 2)
                    .width(patternPart)
                    .draw()
            })


    }

}
