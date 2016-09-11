d3.drawPP = class {
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
    discrete(val) {
        this._discrete= val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width - conf.plotMargin.left - conf.plotMargin.right,
            height = this._height - conf.plotMargin.top - conf.plotMargin.bottom,
            lineColor = this._lineColor,
            discrete= this._discrete,
            svg = this.svg,
            data = this.data;

        var canvas = svg.append('g')
            .attr('transform', d3.translate(conf.plotMargin.left, conf.plotMargin.top))


        var y = d3.scale.linear()
            .domain([0, 1])
            .range([height, 0]);

        var x = d3.scale.linear()
            .domain(d3.extent(data.x))
            .range([0, width])


        var line = d3.svg.line()
            .x(d => x(d.x))
            .y(d => y(d.y))

        var confidenceArea = d3.svg.area()
            .x(function(d) {
                return x(d["x"]);
            })
            .y0(function(d) {
                return y(d["yl"]);
            })
            .y1(function(d) {
                return y(d["yu"]);
            });

        canvas.selectAll('.confArea')
            .data(data.prob).enter()
            .append('path')
            .datum(d => d.data)
            .attr("class", 'confArea')
            .attr("d", confidenceArea)
            .attr('fill', (d, i, j) => {
                return lineColor(data.prob[i].group);
            })

        canvas.selectAll('.probLine')
            .data(data.prob).enter()
            .append('path')
            .datum(d => d.data)
            .attr("class", 'probLine lines')
            .attr("d", line)
            .attr('stroke', (d, i, j) => {
                return lineColor(data.prob[i].group);
            })

        canvas.append('text')
            .text(data.attr)
            .attr("class", 'probTitle')
            .attr('x', width/2-30)


        //append axis
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

        //draw marginal effect
        // canvas.append('rect')
        //     .attr({
        //         width:width,
        //     })
        // canvas.selectAll('.probLine')
        //     .data(data.prob).enter()
        //     .append('path')
        //     .datum(d => d.data)
        //     .attr("class", 'probLine lines')
        //     .attr("d", line)
        //     .attr('stroke', (d, i, j) => {
        //         return lineColor(data[type][i].group);
        //     })

    }

}
