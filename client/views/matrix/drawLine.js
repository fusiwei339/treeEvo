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
    lineColor(val) {
        this._lineColor= val;
        return this;
    }

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width-conf.plotMargin.left-conf.plotMargin.right,
            height = this._height-conf.plotMargin.top-conf.plotMargin.bottom,
            lineColor= this._lineColor,
            standardize = this._standardize,
            svg = this.svg,
            data = this.data;

        var canvas=svg.append('g')
            .attr('transform', d3.translate(conf.plotMargin.left, conf.plotMargin.top))

        // if (standardize) {
        //     _.each(data, (d, i) => {
        //         var overall = conf.stat[this.data.attr][i].y
        //         d.y = overall ? (d.y / overall) : d.y;
        //     })
        // }

        var yDomain=[];
        _.each(data.marginY, obj=>{
            yDomain.push(...d3.extent(obj.data, function(d){
                return d.y;
            }));
        })
        var y = d3.scale.linear()
            .domain([-0.1, .1])
            // .domain(d3.extent(yDomain))
            .range([height, 0]);

        var x = d3.scale.linear()
            .domain(d3.extent(data.x))
            .range([0, width])


        var line = d3.svg.line()
            .x(d => x(d.x))
            .y(d => y(d.y))

        canvas.selectAll('.lines')
            .data(data.marginY).enter()
            .append('path')
            .datum(d=>d.data)
            .attr("class", "marginLine")
            .attr("d", line)
            .attr('stroke', (d, i, j)=>{
                return lineColor(data.marginY[i].path);
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
