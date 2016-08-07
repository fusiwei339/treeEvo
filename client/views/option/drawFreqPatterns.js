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
    depth(val) {
        this._depth = val;
        return this;
    }

    draw() {
        var data = this.data;
        var svg = this.svg;
        var width = this._width;
        var height = this._height;
        var depth = this._depth;
        var conf = Template.structureItem.configure;
        var dataProcessor = Template.matrix.dataProcessor;


        var pattern = { width: width / 5, height: 50 + 10 * (depth - 1) };
        var top = data.slice(0, 15);

        var xScale = d3.scale.ordinal()
            .domain([0, 1, 2, 3, 4])
            .rangeBands([conf.pattern.margin, width - conf.pattern.margin])

        svg.selectAll('.structureG').data(top)
            .enter().append('g')
            .attr('class', 'structureG')
            .attr('transform', (d, i) => {
                let y = Math.floor(i / 5) * pattern.height + conf.pattern.margin;
                return d3.translate(xScale(i % 5), y)
            })
            .each(function(d, i) {
                let canvas = d3.select(this);
                let tree = dataProcessor.seq2tree(d.pattern);

                canvas.append('rect')
                    .attr('width', pattern.width)
                    .attr('height', pattern.height)
                    .attr('y', -conf.pattern.margin / 2)
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


    }


}
