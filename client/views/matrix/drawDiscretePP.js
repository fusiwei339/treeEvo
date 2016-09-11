d3.drawDiscretePP = class {
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

        _.each(data.prob, line => {
            line.data = [line.data[0], line.data[line.data.length - 1]]
        })
        _.each(data.marginY, line => {
            line.data[line.data.length - 1].x = 1;
            line.data = [line.data[0], line.data[line.data.length - 1]]
        })

        var canvas = svg.append('g')
            .attr('transform', d3.translate(conf.plotMargin.left, conf.plotMargin.top))


        var y = d3.scale.linear()
            .domain([0, 1])
            .range([height, 0]);
        var yMargin = d3.scale.linear()
            .domain([-.2, .2])
            .range([height, 0]);

        var x = d3.scale.ordinal()
            .domain([0, 1])
            .rangePoints([0, width], .3)


        var yMargin = d3.scale.linear()
            .domain([-.2, .2])
            .range([height, 0]);

        canvas.selectAll('.errBarLine')
            .data(data.prob).enter()
            .append('g')
            .attr("class", 'errBarLine')
            .selectAll('.probCircleBar')
            .data(d => d.data)
            .enter().append('path')
            .attr('class', 'probCircleBar')
            .attr('d', function(d) {
                var centerX = x(d.x);
                var centerY = y(d.y);
                var upperY = y(d.yu);
                var lowerY = y(d.yl);
                var extra = 3;

                return geom.path.begin()
                    .move_to(centerX - extra, upperY)
                    .line_to(centerX + extra, upperY)
                    .move_to(centerX, upperY)
                    .line_to(centerX, lowerY)
                    .move_to(centerX - extra, lowerY)
                    .line_to(centerX + extra, lowerY)
                    .end()
            })
            .attr('stroke', (d, i, j) => {
                return lineColor(data.prob[j].group);
            })

        canvas.selectAll('.linkingLine')
            .data(data.prob).enter()
            .append('path')
            .attr('class', 'linkingLine')
            .attr('d', function(d) {
                var beginx = x(d.data[0].x);
                var beginy = y(d.data[0].y);
                var endx = x(d.data[1].x);
                var endy = y(d.data[1].y);

                return geom.path.begin()
                    .move_to(beginx, beginy)
                    .line_to(endx, endy)
                    .end()
            })
            .attr('stroke', (d, i) => {
                return lineColor(d.group);
            })


        canvas.selectAll('.errBarPoint')
            .data(data.prob).enter()
            .append('g')
            .attr("class", 'errBarPoint')
            .selectAll('.probCircle')
            .data(d => d.data)
            .enter().append('circle')
            .attr('class', 'probCircle')
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr('r', 3)
            .attr('fill', (d, i, j) => {
                return lineColor(data.prob[j].group);
            })
            .attr('stroke', (d, i, j) => {
                return lineColor(data.prob[j].group);
            })

        canvas.append('text')
            .text(conf.captionMapping[data.attr])
            .attr("class", 'probTitle')
            .attr('x', width / 2 - 30)
            .attr('y', -5)


        //append axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
        canvas.append('g')
            .attr("class", "y axis nonMarginal")
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
        canvas.append('rect')
            .attr({
                width: width + conf.plotMargin.left,
                height: height,
                class: 'marginal shadowRect'
            })
        canvas.selectAll('.marginlinkingLine')
            .data(data.marginY).enter()
            .append('path')
            .attr('class', 'marginlinkingLine marginal')
            .attr('d', function(d) {
                var beginx = x(d.data[0].x);
                var beginy = yMargin(d.data[0].y);
                var endx = x(d.data[1].x);
                var endy = yMargin(d.data[1].y);

                return geom.path.begin()
                    .move_to(beginx, beginy)
                    .line_to(endx, endy)
                    .end()
            })
            .attr('stroke', (d, i) => {
                return lineColor(d.group);
            })

        canvas.selectAll('.marginPoint')
            .data(data.marginY).enter()
            .append('g')
            .attr("class", 'marginPoint marginal')
            .selectAll('.marginCircle')
            .data(d => d.data)
            .enter().append('circle')
            .attr('class', 'marginCircle')
            .attr("cx", d => x(d.x))
            .attr("cy", d => yMargin(d.y))
            .attr('r', 3)
            .attr('fill', (d, i, j) => {
                return lineColor(data.marginY[j].group);
            })
            .attr('stroke', (d, i, j) => {
                return lineColor(data.marginY[j].group);
            })
        var yAxis2 = d3.svg.axis()
            .scale(yMargin)
            .orient('right')
        canvas.append('g')
            .attr("class", "y axis marginal")
            .attr("transform", d3.translate(width, 0))
            .call(yAxis2);


    }

}
