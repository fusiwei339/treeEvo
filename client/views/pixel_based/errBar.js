d3.drawErrBar = class {

    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    draw() {
        // add in the nodes
        var data = this.data;
        var conf = Template.lineage.configure;
        var dataProcessor = Template.lineage.dataProcessor;
        var animationDur = conf.animationDur;
        var canvasHeight = conf.svgHeight / 2 - conf.margin;
        var padding = conf.padding;

        var y = d3.scale.linear()
            .range([canvasHeight - padding, padding])
            .domain([0, 100]);
        var y2 = d3.scale.linear()
            .range([canvasHeight-padding, padding])
            .domain([0, 10]);

        var relativeH = d3.scale.linear()
            .range([0, canvasHeight - 2 * padding])
            .domain([0, 100]);
        var relativeH2 = d3.scale.linear()
            .range([0, canvasHeight - 2 * padding])
            .domain([0, 10]);

        var rectWidth=conf.rectWidth;
        var barTypes = conf.demographicAttr;
        var x = d3.scale.ordinal()
            .domain(barTypes)
            .rangePoints([conf.padding, rectWidth- conf.padding], 2);

        var data2draw = dataProcessor.getStatData(this.data.stat);

        var selection = this.svg.selectAll('.pathG')
            .data(data2draw)
            .enter().append("g")
            .attr("class", 'pathG')


        // linking lines
        selection.append('path')
            .attr('class', function(d) {
                return 'linkings'
            })
            .attr('d', function(d, i) {
                if (i == 0 || i == 4) return;
                var prevNode = data2draw[i - 1];
                var current = {
                    x: x(d.name),
                    y: y(d.mean)
                };
                var prev = {
                    x: x(prevNode.name),
                    y: y(prevNode.mean)
                };
                return geom.path.begin()
                    .move_to(current.x, current.y)
                    .line_to(prev.x, prev.y)
                    .end();

            })

        //std dev lines
        selection.append('path')
            .attr('class', function(d) {
                return 'line' + data.cluster + data.generation + d.name + ' ErrBarLine';
            })
            .attr('d', function(d) {
                var centerX = x(d.name);
                var centerY = y(d.mean);
                var lineH = relativeH(d.std);
                if(d.name==='SON_COUNT'){
                    centerY=y2(d.mean);
                    lineH=relativeH2(d.std);
                }
                var extra = 3;

                return geom.path.begin()
                    .move_to(centerX - extra, centerY - lineH)
                    .line_to(centerX + extra, centerY - lineH)
                    .move_to(centerX, centerY - lineH)
                    .line_to(centerX, centerY + lineH)
                    .move_to(centerX - extra, centerY + lineH)
                    .line_to(centerX + extra, centerY + lineH)
                    .end()
            })
            .attr('opacity', 0)

        // nodes
        this.svg.selectAll('.nodeG')
            .data(data2draw)
            .enter().append("g")
            .attr("class", 'nodeG')
            .append("circle")
            .attr('class', function(d) {
                return 'circle' + data.cluster + data.generation + d.name + ' ErrBarCircle';
            })
            .attr('cx', function(d) {
                return x(d.name)
            })
            .attr('cy', function(d) {
                if(d.name==='SON_COUNT') return y2(d.mean);
                return y(d.mean)
            })
            .attr('r', function(d) {
                return padding;
            })
            .style('fill', function(d) {
                return conf.colorScale(data.cluster);
            })
            .on('mouseover', function(d) {
                var str = 'line' + data.cluster + data.generation + d.name;
                d3.selectAll('.' + str).attr('opacity', 1);
            })
            .on('mouseleave', function(d) {
                var str = 'line' + data.cluster + data.generation + d.name;
                d3.selectAll('.' + str).attr('opacity', 0);
            })


    }
}
