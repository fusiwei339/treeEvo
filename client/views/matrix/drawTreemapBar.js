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

        var colorScale = conf_option.graidentColorScale[attr]
            .domain(conf_option.graidentColorDomain[attr])
            .range(conf_option.graidentColorRange[attr])

        redraw();

        function redraw() {
            var rects = dataProcessor.getTreemapData(data.trees, {
                top: 0,
                left: 0,
                width: width,
                height: height,
            }, attr)

            var rectSelection = svg.selectAll('.sRect').data(rects, d => d.id = d.obj.pattern)

            rectSelection.enter().append('rect')
                .attr('class', 'sRect')
                .attr('y', e => e.rect.top)
                .attr('x', e => e.rect.left)
                .attr('width', e => e.rect.width)
                .attr('height', e => e.rect.height)
                .attr('fill', e => colorScale(e.obj[attr]))
                .on('click', e => {
                    var targetPattern = e.obj.pattern.join();
                    for (let i = 0, len = data.trees.length; i < len; i++) {
                        let tree = data.trees[i];
                        if (tree.pattern.join() === targetPattern) {
                            if (tree._count) {
                                tree.count = tree._count;
                                tree._count = null;
                            } else {
                                tree._count = tree.count;
                                tree.count = d3.sum(data.trees, d => d.count);
                            }
                            redraw()

                            break;
                        }
                    }
                })

            rectSelection.transition()
                .duration(duration)
                .attr('y', e => e.rect.top)
                .attr('x', e => e.rect.left)
                .attr('width', e => e.rect.width)
                .attr('height', e => e.rect.height)
                .attr('fill', e => colorScale(e.obj[attr]))

            rectSelection.exit()
                .transition()
                .duration(duration)
                .remove()


            var trees = dataProcessor.filterRects(rects)
            var treeSelection = svg.selectAll('.sampleTree').data(trees, d => d.id = d.obj.pattern)

            treeSelection.enter().append('g')
                .attr('class', 'sampleTree')
                .attr('transform', d => d3.translate(d.rect.left, d.rect.top))
                .each(function(d, i) {
                    let g = d3.select(this);
                    let tree = dataProcessor.seq2tree(d.obj.pattern);

                    new d3.drawTree(g, tree)
                        .height(d.rect.height)
                        .width(d.rect.width)
                        .padding(5)
                        .draw()
                })

            treeSelection.transition()
                .duration(duration/2)
                .attr('transform', d => d3.translate(d.rect.left, d.rect.top))
                .each(function(d, i) {
                    let g = d3.select(this);
                    let tree = dataProcessor.seq2tree(d.obj.pattern);

                    new d3.drawTree(g, tree)
                        .height(d.rect.height)
                        .width(d.rect.width)
                        .padding(5)
                        .draw()
                })

            treeSelection.exit()
                .transition()
                .duration(duration/2)
                .remove()
        }

    }
}
