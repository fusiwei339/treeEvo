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
        this._lineColor= val;
        return this;
    }
    type(val) {
        this._type= val;
        return this;
    }
    ydomain(val) {
        this._ydomain= val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width-conf.plotMargin.left-conf.plotMargin.right,
            height = this._height-conf.plotMargin.top-conf.plotMargin.bottom,
            lineColor= this._lineColor,
            type= this._type,
            ydomain= this._ydomain,
            svg = this.svg,
            data = this.data;

        var canvas=svg.append('g')
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

        canvas.selectAll(`${type}.Lines`)
            .data(data[type]).enter()
            .append('path')
            .datum(d=>d.data)
            .attr("class", type+"Line lines")
            .attr("d", line)
            .attr('stroke', (d, i, j)=>{
                return lineColor(data[type][i].path);
            })

        //append y axis
        var yAxis=d3.svg.axis()
            .scale(y)
            .orient('left')
        canvas.append('g')
            .attr("class", "y axis")
            .attr("transform", d3.translate(0, 0))
            .call(yAxis);

        var xAxis=d3.svg.axis()
            .scale(x)
            .orient('bottom')
        canvas.append('g')
            .attr("class", "x axis")
            .attr("transform", d3.translate(0, height))
            .call(xAxis);

        // // svg.append('rect')
        // //     .attr({
        // //         height: height,
        // //         width: width,
        // //         fill: 
        // //     })

        // svg.append("path")
        //     .datum(data)
        //     .attr("class", "line")
        //     .attr("d", line);

    }
}
