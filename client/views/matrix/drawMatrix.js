d3.drawMatrix = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    draw() {

        var conf = Template.matrix.configure;
        var dataProcessor = Template.matrix.dataProcessor;

        var data = this.data;
        var svg = this.svg;
        var animationDur = 500;
        var circleR = conf.circleR;
        var totalWidth = $('#matrixDiv').width();
        var totalHeight = $('#matrixDiv').height();

        var nRows = Math.ceil(data.length / 3);
        svg.attr('height', totalHeight / 2 * nRows);

        var rectCanvas = svg.select('#rectCanvas')
        rectCanvas.selectAll('*').remove();

        //draw rect
        var xScale = d3.scale.ordinal()
            .domain([0, 1, 2])
            .rangeBands([conf.margin, totalWidth], 0, 0)

        var groupColor = d3.googleColor;

        var rectSelection = rectCanvas.selectAll('.matrixCell')
            .data(data, d => d.id = d.attr)

        rectSelection.enter()
            .append('g')
            .attr({
                class: 'matrixCell',
            })
            .attr('transform', (d, i) => d3.translate(xScale(i % 3), Math.floor(i / 3) * totalHeight / 2))
            .each(function(d, i) {
                let canvas = d3.select(this);
                if (d.attr !== 'POSITION') {
                    new d3.drawPP(canvas, d)
                        .width(xScale.rangeBand())
                        .height(totalHeight / 2)
                        .lineColor(groupColor)
                        .draw();
                } else {
                    new d3.drawDiscretePP(canvas, d)
                        .width(xScale.rangeBand())
                        .height(totalHeight / 2)
                        .lineColor(groupColor)
                        .draw();
                }

            })


    }

}
