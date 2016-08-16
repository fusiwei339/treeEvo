d3.drawPixelMatrix = class {
    constructor(canvas, data) {
        this.canvas = canvas;
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

        var width = this._width-conf.groupMargin.left-conf.groupMargin.right,
            height = this._height-conf.groupMargin.top-conf.groupMargin.bottom,
            canvas = this.canvas,
            data = this.data;

        var context = canvas.node().getContext("2d");

        var colorScale = d3.scale.log()
            .domain(d3.extent(data, d => d.personids.length))
            .range(['#f8f8f8', '#4682b4'])
            // clear canvas
        context.fillStyle = "#fff";
        context.rect(0, 0, width, height);
        context.fill();
        var size=Math.sqrt(width*height/data.length);
        var nCol=Math.floor(width/size)

        _.each(data, (d, i) => {
            context.beginPath();
            context.fillStyle = colorScale(d.personids.length);
            context.rect((i%nCol)*size, Math.floor(i/nCol)*size, size, size);
            context.fill();
            context.closePath();
        })

    }
}
