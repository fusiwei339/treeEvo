Template.clusterWindow.rendered = function() {
    var svg = d3.select('#clusterWindow')
    var optionItem_conf = Template.optionItem.configure;
    var conf = Template.clusterWindow.configure;
    var flow_conf = Template.flow.configure;
    var option_conf = Template.option.configure;

    var optionItem_dataProcessor = Template.optionItem.dataProcessor;
    var dataProcessor = Template.clusterWindow.dataProcessor;

    Deps.autorun(function() {
        Session.get('clusterBtn');

        var items = dataProcessor.getClusterData(optionItem_conf.clusterRange);
        var svgWidth = $('#clusterWindow').width();
        var svgHeight = $('#clusterWindow').height();

        svg.selectAll('*').remove();
        svg.selectAll('.attrs')
            .data(items).enter()
            .append('g')
            .attr('class', 'attrs')
            .attr('transform', function(d, i) {
                return d3.translate(0, conf.oneLineHeight * i);
            })
            .each(function(d, i) {
                var chartWidth = svgWidth * conf.chartPart;
                var g = d3.select(this);

                g.append('text')
                    .attr('class', 'label')
                    .attr('x', 0)
                    .attr('y', 10)
                    .text(d.name);

                var option = optionItem_dataProcessor.getOption(malePeople, d.name);
                var malePeople = flow_conf.malePeople_toUse;
                var filteredData = dataProcessor.applyFilter(malePeople, option.filter, d.name);

                var days = d3.nest()
                    .key(function(p) {
                        return p[d.name];
                    })
                    .entries(filteredData)
                    .sort(function(a, b) {
                        return +a.key - (+b.key);
                    })
                var yMax = d3.max(days, function(day) {
                    return day.values.length;
                })

                var seg = g.selectAll('.segments')
                    .data(d.value).enter()
                    .append('g')
                    .attr('class', 'segments')
                    .attr('transform', function(e, j, list) {
                        var x = 0;
                        for (var idx = 0; idx < j; idx++) {
                            x += d.value[idx].width * chartWidth;
                        }
                        return d3.translate(x + conf.labelPart * chartWidth, 0);
                    })
                    .each(function(e, j) {
                        var canvas = d3.select(this);

                        var option = optionItem_dataProcessor.getOption(malePeople, d.name);
                        canvas.selectAll('*').remove();

                        option.range = e.range;
                        option.filter.push(e.range);
                        option.yMax = yMax;

                        attrStat = new d3.attrStat(canvas, malePeople)
                            .width(e.width * chartWidth)
                            .height(conf.oneLineHeight)
                            .option(option)
                            .drawSlice(false)
                            .draw()

                        var drag = d3.behavior.drag()
                            .origin(function(d) {
                                return {
                                    x: 0,
                                    y: 0,
                                };
                            })
                            .on('dragstart', function() {
                                d3.event.sourceEvent.stopPropagation();
                                dragableG.select('text')
                                    .style('opacity', 1)
                                dragableG.select('rect')
                                    .style('opacity', .5)

                            })
                            .on('drag', function(d) {
                                d3.select(this)
                                    .attr('transform', d3.translate(d3.event.x, d3.event.y));
                                if (d3.event.y + i * conf.oneLineHeight > (items.length * conf.oneLineHeight + conf.lineMarginTop)) {
                                    dragableG.select('rect')
                                        .style('fill', 'red')
                                } else {
                                    dragableG.select('rect')
                                        .style('fill', 'white')
                                }

                            })
                            .on('dragend', function(d) {

                                dragableG.transition()
                                    .duration(800)
                                    .attr('transform', d3.translate(0, 0))
                                    .selectAll('*')
                                    .style('opacity', 0)
                            })
                        var dragableG = canvas.append('g')
                            .attr('class', 'dragable')
                            .call(drag)

                        dragableG.append('rect')
                            .attr('width', e.width * chartWidth)
                            .attr('height', conf.oneLineHeight)
                            .attr('class', 'overlayRect')
                        dragableG.append('text')
                            .attr('x', 10)
                            .attr('y', 10)
                            .text(function() {
                                var temp = canvas.data()[0];
                                var obj = {}
                                obj[temp.name] = temp.range;
                                return JSON.stringify(obj);
                            })
                            .style('opacity', 0)
                    })

            })

        var partitionY = items.length * conf.oneLineHeight + conf.lineMarginTop;

        d3.addSeparateBtn(svg, partitionY, svgWidth);

    })

    Deps.autorun(function() {
        var clusters = Session.get('clusterPreview');
        if (_.isEmpty(clusters)) return;

        var items = dataProcessor.getClusterData(optionItem_conf.clusterRange);
        var partitionY = items.length * conf.oneLineHeight + conf.lineMarginTop;

        svg.selectAll('.clusterPreviewG').remove();
        svg.append('g')
            .attr('class', 'clusterPreviewG')
            .attr('transform', d3.translate(0, partitionY + conf.lineMarginTop))
            .selectAll('.clustersPreview')
            .data(clusters)
            .enter().append('g')
            .attr('class', 'clusterPreview')
            .attr('transform', function(d, i) {
                return d3.translate(0, i * conf.clusterPreview.height);
            })
            .each(function(d, i) {
                var canvas = d3.select(this);
                var colorArr = Template.option.configure.clusterColors;
                var color=colorArr[d.order];

                var drawBtn = new d3.drawBtn(canvas, d.description)
                    .fill(color)
                    .width(conf.clusterPreview.width)
                    .height(conf.clusterPreview.height)
                    .roundCorner(conf.clusterPreview.round)

                drawBtn.draw();
            })
    })

}


Template.clusterWindow.helpers({
    'clusters': function() {
        Session.get('clusterBtn');
        var optionItem_conf = Template.optionItem.configure;
        return JSON.stringify(optionItem_conf.clusterRange);
    },
})

Template.clusterWindow.events({
    'click #finishClusterDef': function(e, template) {
        var clusters=Session.get('clusterPreview')
        console.log(clusters)
        // Session.set('clusterMalePeople', clusters);
        $('#clusterModal').modal('hide');
    }
});
