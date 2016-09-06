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
        var conf_option = Template.option.configure;

        var width = this._width,
            height = this._height,
            svg = this.svg,
            data = this.data;

        var duration = 800;
        var dataProcessor = Template.matrix.dataProcessor;

        var attr = Session.get('distributionName') || 'lean'

        var rects = dataProcessor.getTreemapData(data.trees, {
            top: 0,
            left: 0,
            width: width,
            height: height,
        }, attr)

        var colorScale=conf_option.graidentColorScale[attr]
            .domain(conf_option.graidentColorDomain[attr])
            .range(conf_option.graidentColorRange[attr])

        var rects_svg = svg.selectAll('.sRect').data(rects)
            .enter().append('rect')
            .attr('class', 'sRect')
            .attr('y', e => e.rect.top)
            .attr('x', e => e.rect.left)
            .attr('width', e => e.rect.width)
            .attr('height', e => e.rect.height)
            .attr('fill', e => colorScale(e.obj[attr]))

        var x = d3.scale.identity().domain([0, width]),
            y = d3.scale.identity().domain([0, height]);

        var quadtree = d3.geom.quadtree()
            .extent([
                [-1, -1],
                [width + 1, height + 1]
            ])
            .x(d => d.rect.left)
            .y(d => d.rect.top)
            (rects)

        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brush", () => {
                var extent = brush.extent();

                rects_svg.each(function(d) { d.selected = false; });
                search(quadtree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
                rects_svg.classed("selected", function(d) {
                    return d.selected;
                });
            })
            .on('brushend', ()=>{
                var selectedRects=rects_svg.filter(d=>d.selected).data()
                conf.selectedRects=selectedRects;
                Session.set('selectedRects', new Date());
            })

        svg.append("g")
            .attr("class", "brush")
            .call(brush)

        function search(quadtree, x0, y0, x3, y3) {
            quadtree.visit(function(node, x1, y1, x2, y2) {
                var p = node.point;
                if (p) p.selected = (p.rect.left >= x0) && (p.rect.left < x3) && (p.rect.top >= y0) && (p.rect.top < y3);
                return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            });
        }


    }
}
