d3.drawBrushedPatterns = class {
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
    patternHeight(val) {
        this._patternHeight= val;
        return this;
    }

    draw() {
        var data = this.data;
        var svg = this.svg;
        var width = this._width;
        var height = this._height;
        var patternHeight= this._patternHeight;
        var conf = Template.option.configure;
        var animationDur = 800;
        var dataProcessor = Template.matrix.dataProcessor;
        var nPatterns=8;
        data.sort((a, b)=>b.obj.count-a.obj.count)

        var xScale = d3.scale.ordinal()
            .domain(_.range(nPatterns))
            .rangeBands([0, width], 0.05, 0)

        var pattern = { width: xScale.rangeBand(), height: patternHeight};

        var selection = svg.selectAll('.structureG')
            .data(data, (d, i) => d.id = i)

        selection.enter().append('g')
            .attr('class', 'structureG')
            .attr('transform', (d, i) => {
                return d3.translate(xScale(i % nPatterns), Math.floor(i/nPatterns)*patternHeight)
            })
            .each(function(d, i) {
                let canvas = d3.select(this);
                let tree = dataProcessor.seq2tree(d.obj.pattern);

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
        //     .on('mouseover', function(d) {
        //         d3.select(this).select('rect')
        //             .attr('fill', '#ddd')
        //     })
        //     .on('mouseleave', function(d) {
        //         d3.select(this).select('rect')
        //             .attr('fill', '#fff')
        //     })

        selection.transition().duration(animationDur)
            .attr('transform', (d, i) => {
                return d3.translate(xScale(i % nPatterns), Math.floor(i/nPatterns)*patternHeight)
            })
            .each(function(d, i) {
                let canvas = d3.select(this);
                let tree = dataProcessor.seq2tree(d.obj.pattern);

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
