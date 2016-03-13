d3.drawBtn = class {

    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    fill(val) {
        if (!val) return this._fill;
        this._fill = val;
        return this;
    }
    roundCorner(val) {
        if (!val) return this._roundC;
        this._roundC = val;
        return this;
    }
    width(val) {
        if (!val) return this._width;
        this._width = val;
        return this;
    }
    height(val) {
        if (!val) return this._height;
        this._height = val;
        return this;
    }

    draw() {
        var conf = Template.clusterWindow.configure;
        var dataProcessor = Template.clusterWindow.dataProcessor;
        var optionItem_conf = Template.optionItem.configure;

        var svg=this.svg;
        var data=this.data;

        svg.append('rect')
            .attr('rx', this._roundC)
            .attr('ry', this._roundC)
            .attr('width', this._width)
            .attr('height', this._height)
            .attr('class', 'clusterPreview')
            .style('fill', this._fill)
        svg.append('text')
            .attr('x', 12)
            .attr('y', 20)
            .text(JSON.stringify(this.data))
            .attr('class', 'clusterPreviewText')

    }

}
