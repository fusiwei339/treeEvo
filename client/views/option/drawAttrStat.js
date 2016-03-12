d3.attrStat = class {

    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
        this._xAxis;
        this._dots=[];
    }

    option(val) {
        if(! val) return this._option;
        this._option = val;
        return this;
    }
    width(val) {
        if(! val) return this._width;
        this._width = val;
        return this;
    }
    height(val) {
        if(! val) return this._height;
        this._height = val;
        return this;
    }
    clearDots(){
        //clear labels
        this._dots=this._dotsOri.slice(0);
        this._xAxis.tickValues(this._dots);
        this.svg.selectAll('.x.axis').call(this._xAxis)

        //clear vertical lines
        this.svg.selectAll('.slice').selectAll('*').remove();
        return this;
    }
    get dots(){
        return this._dots;
    }

    draw() {
        var dataProcessor = Template.option.dataProcessor;
        var option = this._option;
        var scale = option.isConti ? this.drawFlow() : this.drawBar();
        var xAxis = this.drawAxis(scale);
        this._xAxis=xAxis;
        this._dotsOri=dataProcessor.getTickValues(xAxis);
        this._dots=dataProcessor.getTickValues(xAxis);

        this.drawSliceLines(scale, xAxis)
        return this;
            // this.drawBrush(scale, xAxis);
    }

    drawSliceLines(scale, xAxis) {
        var dataProcessor = Template.option.dataProcessor;
        var conf = Template.option.configure;
        var optionItem_conf = Template.optionItem.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg;
        var self=this;

        var g = svg.append('g')
            .attr('class', 'tempSlice')
            .attr('transform', d3.translate(conf.margin.left, conf.margin.top))
        var rect = g.append('rect')
            .attr('class', 'overlayRect')
            .attr('width', width)
            .attr('height', height)
        var sliceG = svg.append('g')
            .attr('class', 'slice')
            .attr('transform', d3.translate(conf.margin.left, conf.margin.top))

        rect
            .on('mouseenter', function(e) {
                var coord = d3.mouse(this);
                g.append('path')
                    .attr('class', 'moving')

                self._dots = dataProcessor.getTickValues(xAxis);
            })
            .on('mouseout', function(e) {
                //remove temp lines
                g.selectAll('.moving').remove();

                //remove a tick
                var ticksTemp = dataProcessor.getTickValues(xAxis);
                ticksTemp.pop()
                xAxis.tickValues(ticksTemp)
                svg.selectAll('.x.axis').call(xAxis)
            })
            .on('mousemove', function(e) {
                //show line
                var coord = d3.mouse(this);
                g.selectAll('.moving')
                    .attr('d', function() {
                        return geom.path.begin()
                            .move_to(coord[0] - 2, 0)
                            .line_to(coord[0] - 2, height+conf.margin.top)
                            .end()
                    })

                //show x label
                try {
                    var xVal = Math.round(scale.x.invert(coord[0] - 2));
                    var ticksTemp = dataProcessor.getTickValues(xAxis);

                    if (ticksTemp.length > self._dots.length) ticksTemp[ticksTemp.length - 1] = xVal;
                    else ticksTemp.push(xVal);

                    xAxis.tickValues(ticksTemp)
                    svg.selectAll('.x.axis').call(xAxis)
                } catch (e) {
                    console.log('x scale error')
                }
            })
            .on('click', function(e) {
                var coord = d3.mouse(this);
                //draw line
                sliceG.append('path')
                    .attr('class', 'slice')
                    .attr('d', function() {
                        return geom.path.begin()
                            .move_to(coord[0] - 2, 0)
                            .line_to(coord[0] - 2, height+conf.margin.top)
                            .end()
                    })

                //draw label
                var ticksTemp = dataProcessor.getTickValues(xAxis);

                self._dots=ticksTemp;
                optionItem_conf.clusterRange[option.svgStr]=self._dots;
                xAxis.tickValues(ticksTemp)
                svg.selectAll('.x.axis').call(xAxis)

            })
    }
    drawBrush(scale, xAxis) {
        var conf = Template.option.configure;
        var width = this._width - conf.margin.left - conf.margin.right,
            height = this._height - conf.margin.top - conf.margin.bottom,
            option = this._option,
            svg = this.svg;

        var brush = d3.svg.brush().x(scale.x)
            .on('brushstart', function() {

                //make the ticks an array of 4
                if (option.isConti) {
                    var ext0 = brush.extent();
                    var ext1 = ext0.map(function(e) {
                        return Math.round(e);
                    })

                    var ticks = xAxis.tickValues();
                    var ticksTemp = ticks.slice(0);
                    if (ticksTemp.length == 2)
                        ticksTemp.push(...ext1);

                    ticksTemp.sort(function(a, b) {
                        return a - b;
                    })
                    xAxis.tickValues(ticksTemp);
                }

            })
            .on('brush', function() {

                //update the the axis when brushing
                if (option.isConti) {
                    var ext0 = brush.extent();
                    var ext1 = ext0.map(function(e) {
                        return Math.round(e);
                    })

                    var ticks = xAxis.tickValues();
                    ticks[1] = ext1[0];
                    ticks[2] = ext1[1];
                    xAxis.tickValues(ticks);

                    svg.selectAll('.x.axis').call(xAxis)

                }
            })
            .on('brushend', function() {
                if (option.isConti) {

                    var ext0 = brush.extent();
                    var ext1 = ext0.map(function(e) {
                        return Math.round(e);
                    })
                    d3.select(this).transition()
                        .call(brush.extent(ext1))

                    conf.filter[option.svgStr] = brush.extent();
                } else {
                    var ext0 = brush.extent();
                    if (ext0[0] === ext0[1]) return;

                    var data = d3.select('#' + option.svgStr).selectAll('.histBar').data()
                    var selected = _.filter(data, function(d) {
                        var xCoord = scale.x(d.date);
                        return xCoord >= ext0[0] && xCoord <= ext0[1];
                    })
                    var xDomain = d3.extent(selected, function(d) {
                        return d.date;
                    })
                    d3.select(this).transition()
                        .call(brush.extent(xDomain.map(function(d, i) {
                            var xCoord = scale.x(d);
                            if (i === 0) return xCoord;
                            return scale.x.rangeBand() + xCoord;
                        })))
                    conf.filter[option.svgStr] = [xDomain[0], xDomain[1] + 0.1]
                }
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
                date: +d.key,
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

        return xAxis;
    }
}
