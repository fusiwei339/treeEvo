d3.drawLine = class {
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
    standardize(val) {
        this._standardize = val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width,
            height = this._height,
            standardize = this._standardize,
            svg = this.svg,
            data = this.data.freqArr;

        if (standardize) {
            _.each(data, (d, i) => {
                var overall = conf.stat[this.data.attr][i].y
                d.y = overall ? (d.y / overall) : d.y;
            })
        }

        var y = d3.scale.linear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height, 0]);

        var x = d3.scale.linear()
            .domain(d3.extent(data, d => d.x))
            .range([0, width])

        var line = d3.svg.line()
            .x(d => x(d.x))
            .y(d => y(d.y))

        // svg.append('rect')
        //     .attr({
        //         height: height,
        //         width: width,
        //         fill: 
        //     })

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

    }
}
