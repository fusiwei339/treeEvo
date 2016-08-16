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
        var totalHeight = ($(svg[0]).height() - conf.labelPart) / 2;

        var rectCanvas = svg.select('#rectCanvas')
        rectCanvas.selectAll('*').remove();
        var patternCanvas = svg.select('#patternCanvas')
        patternCanvas.selectAll('*').remove();

        //draw rect
        var xScale = d3.scale.ordinal()
            .domain(_.map(data, d => d.attr))
            .rangeBands([conf.margin, totalWidth])

        var yScale = d3.scale.ordinal()
            .domain(_.map(data[0].marginY, d => d.path))
            .rangeBands([0, totalHeight], .1, 0)

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
            })

        // rectSelection.transition()
        //     .duration(animationDur)
        //     .select('g')
        //     .attr('transform', d => d3.translate(xScale(d.attr), 0))
        //     .each(function(d, i) {
        //         var canvas = d3.select(this);

        //         new d3.drawLine(canvas, d)
        //             .width(xScale.rangeBand() - conf.margin)
        //             .height(yScale.rangeBand() * 5)
        //             .standardize(true)
        //             .lineColor(groupColor)
        //             .draw();
        //     })

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
            if (Array.isArray(pattern.path)) {
                let paths = pattern.path;
                let pathArr = _.map(paths, path => dataProcessor.seq2tree(path)).slice(0, 6);
                treeMap[pattern.path.join(',')] = pathArr
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
            .each(function(d, i) {
                var canvas = d3.select(this);
                let tree = treeMap[d]
                var yMargin = 5;
                if (!Array.isArray(tree)) {
                    canvas.append('rect')
                        .attr('class', 'background')
                        .attr({
                            width: patternPart,
                            height: yScale.rangeBand(),
                            stroke: groupColor(d),
                        })
                        // var g=canvas.append('g').attr('transform', d3.translate(0, conf.treePadding))
                    new d3.drawTree(canvas, tree)
                        .height(yScale.rangeBand())
                        .width(patternPart)
                        .padding(5)
                        .draw()
                } else {
                    new d3.drawMultiTrees(canvas, tree)
                        .height(yScale.rangeBand())
                        .width(patternPart)
                        .stroke(groupColor(d))
                        .draw()
                }
            })


    }

}
