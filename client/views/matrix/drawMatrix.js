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
        var dataProcessor = Template.matrix.dataProcessor;

        var data = this.data;
        var svg = this.svg;
        var animationDur = 500;
        var patternPart = this._patternPart;
        var circleR = conf.circleR;
        var totalWidth = $(svg[0]).width();
        var totalHeight = ($(svg[0]).height() - conf.labelPart) / 3;

        var rectCanvas = svg.select('#rectCanvas')
        var patternCanvas = svg.select('#patternCanvas')

        //draw rect
        var xScale = d3.scale.ordinal()
            .domain(_.map(data, d => d.attr))
            .rangeBands([conf.margin, totalWidth])

        var yScale = d3.scale.ordinal()
            .domain(_.map(data[0].marginY, d => d.path))
            .rangeBands([0, totalHeight])

        var groupColor = d3.scale.category10()
            .domain(_.map(data[0].marginY, d => d.path))
            // var colorDomain = _.map(data, d => d.freq / d.dbSize)
            // var colorScale = d3.scale.linear()
            //     .domain([0, d3.max(colorDomain)])
            //     .range(['white', '#54278f'])

        var leanColor = d3.scale.linear()
            .domain([-1, 0, 1])
            .range(['#e08214', '#f7f7f7', '#8073ac'])

        var rectSelection = rectCanvas.selectAll('.matrixCell')
            .data(data, d => d.id = d.attr)

        rectSelection.enter()
            .append('g')
            .attr({
                class: 'matrixCell',
            })
            .attr('transform', d => d3.translate(xScale(d.attr), 0))
            .each(function(d, i) {
                var canvas = d3.select(this);
                new d3.drawLine(canvas, d)
                    .width(xScale.rangeBand() - conf.margin)
                    .height(yScale.rangeBand() * 5)
                    .standardize(true)
                    .lineColor(groupColor)
                    .draw();

                // canvas.append('rect')
                //     .attr({
                //         width: xScale.rangeBand() - conf.margin,
                //         height: yScale.rangeBand() * 5,
                //         fill: '#ccc'
                //     })
            })
            // .attr('fill', d => colorScale(d.freq / d.dbSize))

        // rectSelection.transition()
        //     .duration(animationDur)
        //     .attr({
        //         class: 'matrixCell',
        //         width: xScale.rangeBand(),
        //         height: yScale.rangeBand(),
        //     })
        //     .attr('y', d => yScale(d.path))
        //     .attr('x', d => xScale(d.clusterRange))
        //     .attr('fill', d => colorScale(d.freq / d.dbSize))

        // rectSelection.exit()
        //     .transition()
        //     .duration(animationDur)
        //     .remove()

        //draw x scale
        var labelSelection = rectCanvas.selectAll('.xLabel')
            .data(xScale.domain(), (d, i) => d.id = i)

        labelSelection.exit()
            .transition()
            .duration(animationDur)
            .remove()

        labelSelection.enter()
            .append('text')
            .attr('class', 'xLabel')
            .attr('x', d => xScale(d))
            .attr('y', -5)
            .text(d => d)
        labelSelection.transition()
            .duration(animationDur)
            .attr('x', d => xScale(d))
            .attr('y', -5)
            .text(d => d)



        //draw trees
        var treeMap = {};
        _.each(data[0].marginY, pattern => {
            if (pattern.path === 'others' || pattern.path === 'base') {
                treeMap[pattern.path] = null;
            } else {
                treeMap[pattern.path] = dataProcessor.seq2tree(pattern.path.split(','));
            }
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
            .on('click', function(d) {
                d3.selectAll('.patternTree').classed('selectedRect', false)
                d3.select(this).classed('selectedRect', true)

                d3.selectAll('.patternTree')
                    .classed('highlightRect', false);

                d3.selectAll('.patternTree')
                    .filter(e => {
                        if (dataProcessor.calDistance(e, d) === 1)
                            return true;
                        return false;
                    })
                    .classed('highlightRect', true);
            })
            .each(function(d, i) {
                var canvas = d3.select(this);
                let tree = treeMap[d]
                canvas.append('rect')
                    .attr('class', 'background')
                    .attr({
                        width: patternPart,
                        height: yScale.rangeBand() - conf.treePadding * 2,
                        // fill: leanColor(dataProcessor.calLean(tree)),
                        stroke: groupColor(d),
                        'stroke-width': 2.5,
                        y: -conf.treePadding,
                    })
                if (tree) {
                    var yMargin = 5;
                    new d3.drawTree(canvas, tree)
                        .height(yScale.rangeBand() - yMargin * 2)
                        .width(patternPart)
                        .draw()
                } else {
                    canvas.append('text')
                        .text(d)
                        .attr('x', 5)
                        .attr('y', 20)
                        .attr('font-size', 16)
                }
            })

        // patternTreeSelection.transition()
        //     .duration(animationDur)
        //     .attr('transform', d => d3.translate(0, yScale(d) + conf.treePadding))
        //     .each(function(d, i) {
        //         var canvas = d3.select(this);
        //         let tree = treeMap[d]
        //         canvas.append('rect')
        //             .attr('class', 'background')
        //             .attr({
        //                 width: patternPart,
        //                 height: yScale.rangeBand() - conf.treePadding * 2,
        //                 // fill: leanColor(dataProcessor.calLean(tree)),
        //                 fill: groupColor(d),
        //                 y: -conf.treePadding,
        //             })
        //         if (tree) {
        //             var yMargin = 5;
        //             new d3.drawTree(canvas, tree)
        //                 .height(yScale.rangeBand() - yMargin * 2)
        //                 .width(patternPart)
        //                 .draw()
        //         } else {
        //             canvas.append('text')
        //                 .text(d)
        //                 .attr('x', 10)
        //                 .attr('y', 20)
        //         }
        //     })



    }

}
