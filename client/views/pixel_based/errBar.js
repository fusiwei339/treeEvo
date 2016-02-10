d3.drawErrBar = class {

    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    draw() {
        // add in the nodes
        var conf = Template.lineage.configure;
        var dataProcessor = Template.lineage.dataProcessor;
        var animationDur = conf.animationDur;
        var padding=2

        var y = d3.scale.linear()
            .range([this.data.dy-padding, padding])
            .domain([0, 100]);

        var relativeH=d3.scale.linear()
            .range([0, this.data.dy-2*padding])
            .domain([0, 100]);

        var barTypes = ['f_mar_age', 'SON_COUNT', 'lastage', 'f_bir_age', 'l_bir_age'];
        var x = d3.scale.ordinal()
            .domain(barTypes)
            .rangeBands([conf.padding, 120-conf.padding], 0, 0);

        var data2draw = dataProcessor.getStatData(this.data.stat);
        // var xAxis = d3.svg.axis()
        //     .scale(xRevert)
        //     .orient("top")
        //     .ticks(3);

        var selection = this.svg.selectAll('.barG')
            .data(data2draw).enter().append("g")
            .attr("class", 'barG')

        selection.append("circle")
            .attr('class', function(d) {
                return 'bar';
            })
            .attr('cx', function(d) {
                return x(d.name)
            })
            .attr('cy', function(d) {
                return y(d.mean)
            })
            .attr('r', function(d) {
                return 2;
            })

        selection.append('path')
            .attr('class', 'stdLines')
            .attr('d', function(d){
                var centerX=x(d.name);
                var centerY=y(d.mean);
                var lineH=relativeH(d.std);
                var extra=3;

                return geom.path.begin()
                    .move_to(centerX-extra, centerY-lineH)
                    .line_to(centerX+extra, centerY-lineH)
                    .move_to(centerX, centerY-lineH)
                    .line_to(centerX, centerY+lineH)
                    .move_to(centerX-extra, centerY+lineH)
                    .line_to(centerX+extra, centerY+lineH)
                    .end()
            })
            // mainCanvas.append("g")
            //     .attr("class", "x axis")
            //     .attr("transform", "translate(0," + 0 + ")")
            //     .call(xAxis);

    }
}
