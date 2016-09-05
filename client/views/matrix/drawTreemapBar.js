d3.drawTreemapBars = class {
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

    draw() {
        var conf = Template.matrix.configure;

        var width = this._width,
            height = this._height,
            svg = this.svg,
            data = this.data;

        var duration = 800;
        var dataProcessor = Template.matrix.dataProcessor;
        drawPixel(svg, data, width, height)

        // var xScale = d3.scale.ordinal()
        //     .rangeBands([0, width], .05, .05)
        //     .domain(_.map(data, (d, i) => d.name))

        // var yScale = d3.scale.linear()
        //     .range([height, 0])
        //     .domain([0, d3.max(data, (d, i) => d.people.length)])

        // var selection = svg.selectAll('.groupingBarG')
        //     .data(data, d => d.id = d.name)

        // selection.enter().append('g')
        //     .attr('class', 'groupingBarG')
        //     .attr('transform', (d, i) => d3.translate(xScale(d.name), yScale(d.people.length)))
        //     .on('click', function(d, i) {
        //         Session.set('editBar', d.name);
        //         d3.selectAll('.borderRect')
        //             .attr('stroke', '#fff')
        //         d3.select(this).selectAll('.borderRect')
        //             .attr('stroke', '#ef8a62')
        //     })
        //     .each(function(d, i) {
        //         var canvas = d3.select(this);

        //         var w = xScale.rangeBand()
        //         var h = height - yScale(d.people.length)

        //         canvas.append('rect')
        //             .attr({
        //                 width: w,
        //                 height: h,
        //                 stroke: '#fff',
        //                 'stroke-width': '2px',
        //                 fill: 'white',
        //                 class: 'borderRect'
        //             })

        //         drawPixel(canvas, d, w, h);
        //         // if (d.subGroup) {
        //         //     var subGroup = d.subGroup.sort((a, b) => a.idx - b.idx);
        //         //     var x2 = d3.scale.ordinal()
        //         //         .rangeBands([0, w], 0, 0)
        //         //         .domain(_.map(subGroup, e => e.groupName))

        //         //     canvas.selectAll('.subGroupBarG')
        //         //         .data(d.subGroup).enter()
        //         //         .append('g')
        //         //         .attr('transform', e => d3.translate(x2(e.groupName), yScale(e.people.length)))
        //         //         .each(function(e) {
        //         //             var subcanvas = d3.select(this);
        //         //             var w2 = x2.rangeBand()
        //         //             var h2 = height - yScale(d.people.length)

        //         //             drawPixel(subcanvas, subGroup, w2, h2);
        //         //         })

        //         // } else {
        //         // }

        //     })

        function drawPixel(canvas, d, w, h) {

            var attr='lean'

            var rects = dataProcessor.getTreemapData(d.trees, {
                top: 0,
                left: 0,
                width: w,
                height: h,
            }, attr)

            var extent=d3.extent(rects, e => e.obj[attr])
            var colorScale = d3.scale.linear()
                .domain([extent[0], 0, extent[1]])
                .range(['#b35806', '#fff','#542788'])

            canvas.selectAll('.sRect').data(rects)
                .enter().append('rect')
                .attr('class', 'sRect')
                .attr('y', e => e.rect.top)
                .attr('x', e => e.rect.left)
                .attr('width', e => e.rect.width)
                .attr('height', e => e.rect.height)
                .attr('fill', e => colorScale(e.obj[attr]))

        }

        // selection.transition()
        //     .duration(duration)
        //     .attr('transform', (d, i) => d3.translate(xScale(i), yScale(d.people.length)))
        //     .each(function(d, i) {
        //         var canvas = d3.select(this);

        //         var w = xScale.rangeBand()
        //         var h = height - yScale(d.people.length)

        //         // canvas.append('rect')
        //         //     .attr({
        //         //         width: w,
        //         //         height: h,
        //         //         stroke: '#666',
        //         //         'stroke-width': '1.5px',
        //         //         fill: 'none'
        //         //     })

        //         var rects=dataProcessor.getTreemapData(d.trees, {
        //             top:0,
        //             left:0,
        //             width:w,
        //             height:h,
        //         })

        //         var colorScale=d3.scale.linear()
        //             .domain(d3.extent(rects, d=>+d.text))
        //             .range(['#fff', '#4682b4'])

        //         canvas.selectAll('.sRect').data(rects)
        //             .transition().duration(800)
        //             .attr('y', d=>d.rect.top)
        //             .attr('x', d=>d.rect.left)
        //             .attr('width', d=>d.rect.width)
        //             .attr('height', d=>d.rect.height)
        //             .attr('fill', d=>colorScale(+d.text))

        //     })

        // selection.exit()
        //     .transition()
        //     .duration(duration)
        //     .remove()

        // var xAxis = d3.svg.axis()
        //     .scale(xScale)
        //     .orient("bottom")

        // svg.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", d3.translate(0, height))
        //     .call(xAxis);



    }
}
