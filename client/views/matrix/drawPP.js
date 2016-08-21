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

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width - conf.plotMargin.left - conf.plotMargin.right,
            height = this._height - conf.plotMargin.top - conf.plotMargin.bottom,
            lineColor = this._lineColor,
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

        canvas.selectAll(`.ppLines`)
            .data(data.prob).enter()
            .append('path')
            .datum(d => d.data)
            .attr("class", "ppLine lines")
            .attr("d", line)
            .attr('stroke', (d, i, j) => {
                return lineColor(data.prob[i].path);
            })

        canvas.selectAll('g')
            .data(data.marginY).enter()
            .append('g')
            .selectAll('.marginDots')
            .data(d => {
                return d.data.filter((e, i) => i % 10 === 0)
            })
            .enter()
            .append('circle')
            .attr("class", "marginDots")
            .attr("cx", (d, i, j) => {
                var arr = data.prob[j].data;
                var xtemp = arr[i * 10].x;
                return xtemp ? x(xtemp) : 0;
            })
            .attr("cy", (d, i, j) => {
                var arr = data.prob[j].data;
                var ytemp = arr[i * 10].y;
                return ytemp ? y(ytemp) : 0;
            })
            .attr("r", 1)

        // .attr('stroke', (d, i, j)=>{
        //     '#ccc'
        // })

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

    }

}
