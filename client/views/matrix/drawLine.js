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
    lineColor(val) {
        this._lineColor = val;
        return this;
    }
    type(val) {
        this._type = val;
        return this;
    }
    ydomain(val) {
        this._ydomain = val;
        return this;
    }
    drawCI(val) {
        this._drawCI = val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width - conf.plotMargin.left - conf.plotMargin.right,
            height = this._height - conf.plotMargin.top - conf.plotMargin.bottom,
            lineColor = this._lineColor,
            type = this._type,
            drawCI = this._drawCI,
            ydomain = this._ydomain,
            svg = this.svg,
            data = this.data;

        var canvas = svg.append('g')
            .attr('transform', d3.translate(conf.plotMargin.left, conf.plotMargin.top))


        var y = d3.scale.linear()
            .domain(ydomain)
            .range([height, 0]);

        var x = d3.scale.linear()
            .domain(d3.extent(data.x))
            .range([0, width])


        var line = d3.svg.line()
            .x(d => x(d.x))
            .y(d => y(d.y))

        drawing('', null);

        // if (drawCI) {
        //     drawing('Lower', '5,5')
        //     drawing('Upper', '5,5')
        // }

        function drawing(str, dashedArray) {
            canvas.selectAll(`.${type}${str}Line`)
                .data(data[`${type}${str}`]).enter()
                .append('path')
                .datum(d => d.data)
                .attr("class", `${type}${str}Line lines`)
                .attr("d", line)
                .attr('stroke', (d, i, j) => {
                    return lineColor(data[type][i].group);
                })
                .attr("stroke-dasharray", dashedArray)

        }

        //append y axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
        canvas.append('g')
            .attr("class", "y axis")
            .attr("transform", d3.translate(0, 0))
            .call(yAxis);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
        canvas.append('g')
            .attr("class", "x axis")
            .attr("transform", d3.translate(0, height))
            .call(xAxis);

    }

}
