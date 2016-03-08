d3.attrStat = class {

    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    option(val) {
        this._option = val;
        return this;
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
        var option = this._option;
        var scale = option.isConti ? this.drawFlow() : this.drawBar();
        this.drawAxis(scale);
        this.drawBrush(scale);
    }

    drawBrush(scale) {
        var conf = Template.option.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg;

        var brush = d3.svg.brush().x(scale.x)
            .on('brushstart', function() {

            })
            .on('brush', function() {})
            .on('brushend', function() {
                var ext0 = brush.extent();
                var ext1 = ext0.map(function(e) {
                    return Math.round(e);
                })
                d3.select(this).transition()
                    .call(brush.extent(ext1))

                conf.filter[option.svgStr] = brush.extent();
            })
        svg.append('g')
            .attr('class', 'brush')
            .attr('transform', d3.translate(conf.margin.left, conf.margin.top))
            .call(brush)
            .selectAll('rect')
            .attr('height', height)

    }

    drawBar() {
        var conf = Template.option.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg,
            data = this.data;

        var days = d3.nest()
            .key(function(d) {
                return d[option.svgStr]
            })
            .entries(data)
            .sort(function(a, b) {
                return +a.key - (+b.key);
            })

        var histData = _.map(days, function(d) {
            return {
                date: d.key,
                size: d.values.length
            };
        })

        var x = d3.scale.ordinal()
            .domain(_.map(histData, function(d) {
                return d.date;
            }))
            .rangeBands([0, width], 0.1);

        var y = d3.scale.linear()
            .domain([0, d3.max(histData, function(d) {
                return d.size;
            })])
            .range([height, 0]);

        var barSelection = svg.append('g')
            .attr('transform', d3.translate(conf.margin.left, conf.margin.top))
            .selectAll(".histBar")
            .data(histData)
        barSelection.enter().append('rect')
            .attr("class", 'histBar')
            .attr("x", function(d) {
                return x(d.date);
            })
            .attr("y", function(d) {
                return y(d.size);
            })
            .attr("width", function(d) {
                return x.rangeBand();
            })
            .attr("height", function(d) {
                return height - y(d.size);
            })

        return {
            x: x,
            y: y
        }

    }

    drawFlow() {
        var conf = Template.option.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg,
            data = this.data;

        if (option.filter) {
            data = _.filter(data, function(d) {
                return d[option.svgStr] !== option.filter;
            })
        }

        var days = d3.nest()
            .key(function(d) {
                return d[option.svgStr]
            })
            .entries(data)
            .sort(function(a, b) {
                return +a.key - (+b.key);
            })

        var riverData = _.map(days, function(d) {
            return {
                date: d.key,
                size: d.values.length
            };
        })

        var y = d3.scale.linear()
            .domain([0, d3.max(riverData, function(d) {
                return d.size;
            })])
            .range([height, 0]);

        var xDomain = null;
        if (option.range) {
            xDomain = option.range;
        } else {
            xDomain = d3.extent(riverData, function(d) {
                return d.date;
            })
        }
        var x = d3.scale.linear()
            .range([0, width])
            .domain(xDomain);

        var area = d3.svg.area()
            .interpolate('monotone')
            .x(function(d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function(d) {
                return y(d.size);
            });

        svg.append('g')
            .attr('transform', d3.translate(conf.margin.left, conf.margin.top))
            .datum(riverData)
            .append("path")
            .attr("class", "volume")
            .attr("d", area)

        return {
            x: x,
            y: y
        }
    }

    drawAxis(scale) {
        var conf = Template.option.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg;


        var yAxis = d3.svg.axis()
            .scale(scale.y)
            .orient("left")
            .tickValues(scale.y.domain())
            .tickFormat(d3.format("d"))

        var xAxis = d3.svg.axis()
            .scale(scale.x)
            .orient("bottom")
            .tickValues(scale.x.domain())
            .tickFormat(d3.format("d"))

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", function() {
                return d3.translate(conf.margin.left, conf.margin.top);
            })
            .call(yAxis)
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", function() {
                return d3.translate(conf.margin.left, height + conf.margin.top);
            })
            .call(xAxis)
    }
}
