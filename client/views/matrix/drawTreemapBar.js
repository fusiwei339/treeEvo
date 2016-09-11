d3.drawTreemapBars = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }
    width(val) {
        this._width = val;
        return this;
    }
    height(val) {
        this._height = val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;
        var conf_option = Template.option.configure;

        var width = this._width,
            height = this._height,
            svg = this.svg,
            data = this.data;

        var duration = 800;
        var dataProcessor = Template.matrix.dataProcessor;

        var attr = Session.get('distributionName') || 'lean'

        var rects = dataProcessor.getTreemapData(data.trees, {
            top: 0,
            left: 0,
            width: width,
            height: height,
        }, attr)

        var colorScale=conf_option.graidentColorScale[attr]
            .domain(conf_option.graidentColorDomain[attr])
            .range(conf_option.graidentColorRange[attr])

        var rects_svg = svg.selectAll('.sRect').data(rects)
            .enter().append('rect')
            .attr('class', 'sRect')
            .attr('y', e => e.rect.top)
            .attr('x', e => e.rect.left)
            .attr('width', e => e.rect.width)
            .attr('height', e => e.rect.height)
            .attr('fill', e => colorScale(e.obj[attr]))

    }
}
