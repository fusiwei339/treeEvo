d3.drawBars= class {
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

    draw(){
        var conf = Template.matrix.configure;

        var width = this._width-conf.plotMargin.left-conf.plotMargin.right,
            height = this._height-conf.plotMargin.top-conf.plotMargin.bottom,
            svg = this.svg,
            data = this.data;

    }
}
