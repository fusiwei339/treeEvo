d3.drawMultiTrees = class {
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
    stroke(val) {
        this._stroke = val;
        return this;
    }

    draw() {

        var data = this.data;
        var svg = this.svg;
        var width = this._width || 3;
        var height = this._height || 3;
        var stroke = this._stroke;
        var conf = Template.matrix.configure;
        var padding = 5;

        //add background
        svg.append('rect')
            .attr('class', 'background')
            .attr({
                width: width,
                height: height,
                stroke: stroke,
                y: -conf.treePadding,
            })

        svg.on('mouseenter', () => {
            let newWidth = width * data.length;
            svg.selectAll('.background')
                .transition()
                .duration(conf.duration)
                .attr('width', newWidth)

            // svg.selectAll('.shadowLine')
            //     .transition()
            //     .duration(conf.duration)
            //     .attr('d', d => geom.path.begin()
            //         .move_to(newWidth + d, -conf.treePadding)
            //         .vertical_to(height - conf.treePadding)
            //         .end())

            svg.selectAll('.sampleTree').remove()

            var xScale = d3.scale.ordinal()
                .domain(_.map(data, (d, i) => i))
                .rangeBands([0, newWidth])

            svg.selectAll('.multiSample').data(data)
                .enter().append('g')
                .attr('class', 'multiSample')
                .attr('transform', (d, i) => d3.translate(xScale(i), 0))
                .each(function(d, i) {
                    var canvas = d3.select(this);
                    new d3.drawTree(canvas, d)
                        .height(height)
                        .width(width)
                        .padding(5)
                        .draw()
                })

        }).on('mouseleave', () => {
            svg.selectAll('.multiSample').remove()

            svg.selectAll('.background')
                .transition()
                .duration(conf.duration)
                .attr('width', width)

            drawSample()
        })

        drawSample();

        function drawSample() {
            //draw shadow 
            var sampleG = svg.append('g')
                .attr('class', 'sampleTree')
                // .attr('transform', d3.translate(0, conf.treePadding))

            var shadowArr = [-10, -5, -2.5]
            sampleG.selectAll('.shadowLine')
                .data(shadowArr).enter()
                .append('path')
                .attr('d', d => geom.path.begin()
                    .move_to(width + d, -conf.treePadding)
                    .vertical_to(height - conf.treePadding)
                    .end())
                .attr('class', 'shadowLine')
                .attr('stroke', stroke)

            //draw sample tree
            new d3.drawTree(sampleG, data[0])
                .height(height)
                .width(width + shadowArr[0])
                .padding(5)
                .draw()
        }


    }

}
