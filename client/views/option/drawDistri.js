d3.drawDistribution = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    height(val) {
        this._height = val;
        return this;
    }
    width(val) {
        this._width = val;
        return this;
    }
    attr(val) {
        this._attr = val;
        return this;
    }

    draw() {
        var data = this.data.trees;
        var svg = this.svg;
        var width = this._width;
        var height = this._height;
        var attr = this._attr;
        var conf = Template.matrix.configure;
        var dataProcessor = Template.matrix.dataProcessor;
        var padding = 5;
        var animationDur = 800;

        var data_temp = _.map(data, d => {
            var ret = { count: d.count }
            if (attr === 'population') {
                ret.key = d.pattern.length;
            } else {
                ret.key = d[attr];
            }
            return ret;
        })

        var ret = [];
        _.each(data_temp, d => {
            for (let i = 0; i < d.count; i++, ret.push(d.key));
        })


        // Generate a histogram using twenty uniformly-spaced bins.
        var data_final = d3.layout.histogram()
            .bins(_.range(-.5, .5, .1))
            (ret)

        var y = d3.scale.linear()
            .domain([0, d3.max(data_final, d => d.length)])
            .range([height, 0])

        var x = d3.scale.linear()
            .domain(d3.extent(data_final, (d, i) => i))
            .range([0, width])

        // var selection = svg.selectAll('.histoBar').data(data_final)

        // selection.enter().append('rect')
        //     .attr('class', 'histoBar')
        //     .attr('x', (d, i) => x(i))
        //     .attr('y', (d, i) => y(d.length))
        //     .attr('width', x.rangeBand())
        //     .attr('height', d => height - y(d.length))

        var area = d3.svg.area()
            .interpolate('monotone')
            .x(function(d, i) {
                return x(i);
            })
            .y0(height)
            .y1(function(d) {
                return y(d.length);
            });

        svg.datum(data_final)
            .append("path")
            .attr("class", "volume")
            .attr("d", area)
            .transition()
            .duration(animationDur)
            .attr("d", d => {
                if (!area(d).includes('NaN'))
                    return area(d)
            })

        var selection = svg.selectAll('.volume').data([data_final])

        selection.enter().append('path')
            .attr('class', 'volume')
            .attr('d', d => {
                return d3.svg.area()
                    .interpolate('monotone')
                    .x(x(i))
                    .y0(height)
                    .y1(y(d.length));
            })

        // var path=svg.append('path').data([data_final])
        //     .attr('d', area)
        //     .attr('class', 'volume')

        // path.transition()
        //     .attr('d', area)
        // selection.transition()
        //     .duration(animationDur)
        //     .attr('x', (d, i) => x(i))
        //     .attr('y', (d, i) => y(d.length))
        //     .attr('width', x.rangeBand())
        //     .attr('height', d => height - y(d.length))

        // path.exit()
        //     .transition()
        //     .duration(animationDur)
        //     .remove()


    }

}
