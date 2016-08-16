d3.drawFreqPatterns = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    height(val) {
        this._height = val;
        return this;
    }
    width(val) {
        this._width = val;
        return this;
    }

    draw() {
        var data = this.data;
        var svg = this.svg;
        var width = this._width;
        var height = this._height;
        var conf = Template.option.configure;
        var animationDur=800;
        var dataProcessor = Template.matrix.dataProcessor;


        var pattern = { width: 50, height: height };
        var nPatterns = Math.floor(width / pattern.width);
        if (nPatterns <= 0) return;
        if (data.depth === 1) nPatterns = 5;
        var top = data.trees.slice(0, nPatterns);

        var xScale = d3.scale.ordinal()
            .domain(_.range(nPatterns))
            .rangeBands([conf.freqPatterns.margin, width - conf.freqPatterns.margin])

        var selection=svg.selectAll('.structureG').data(top, d=>d.id=d.pattern.join(','))

        selection.enter().append('g')
            .attr('class', 'structureG')
            .attr('transform', (d, i) => {
                return d3.translate(xScale(i % nPatterns), 0)
            })
            .each(function(d, i) {
                let canvas = d3.select(this);
                let tree = dataProcessor.seq2tree(d.pattern);

                canvas.append('rect')
                    .attr('width', pattern.width)
                    .attr('height', pattern.height - conf.freqPatterns.padding * 2)
                    .attr('y', conf.freqPatterns.padding)
                    .attr('fill', '#fff')
                new d3.drawTree(canvas, tree)
                    .height(pattern.height)
                    .width(pattern.width)
                    .padding(5)
                    .draw()

            })
            .on('mouseover', function(d) {
                d3.select(this).select('rect')
                    .attr('fill', '#ddd')
            })
            .on('mouseleave', function(d) {
                d3.select(this).select('rect')
                    .attr('fill', '#fff')
            })

        selection.transition().duration(animationDur)
            .attr('transform', (d, i) => {
                return d3.translate(xScale(i % nPatterns), 0)
            })
            .each(function(d, i) {
                let canvas = d3.select(this);
                let tree = dataProcessor.seq2tree(d.pattern);

                canvas.select('rect')
                    .attr('width', pattern.width)
                    .attr('height', pattern.height - conf.freqPatterns.padding * 2)
                    .attr('y', conf.freqPatterns.padding)
                    .attr('fill', '#fff')
                new d3.drawTree(canvas, tree)
                    .height(pattern.height)
                    .width(pattern.width)
                    .padding(5)
                    .draw()
            })

        selection.exit()
            .transition()
            .duration(animationDur)
            .remove()

    }


}
