d3.drawStat = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    draw() {

        var data = this.data;
        var featureCanvas = this.svg;
        var conf = Template.lineage.configure;

        var dataByGen = d3.nest()
            .key(function(d) {
                return d.generation;
            })
            .entries(data);

        var genG = featureCanvas.selectAll('.genG')
            .data(dataByGen)
            .enter().append('g')
            .attr("class", "genG")
            .attr("transform", function(d) {
                return "translate(" + d.values[0].x + "," + 0 + ")";
            })

        var rectWidth = conf.rectWidth;
        var barTypes = conf.demographicAttr_text;
        var canvasHeight = conf.svgHeight * (1 - conf.flowPart) - conf.margin;
        var padding = conf.padding;

        var x = d3.scale.ordinal()
            .domain(barTypes)
            .rangePoints([conf.padding, rectWidth - conf.padding], 2);

        genG.append("rect")
            .attr('class', 'featureRect')
            .attr("height", canvasHeight)
            .attr("width", rectWidth)

        genG.selectAll('.labelG')
            .data(barTypes)
            .enter().append('text')
            .attr('class', 'labelG')
            .attr("transform", "rotate(-90)")
            .attr("x", -2)
            .attr("y", function(d) {
                return x(d) - 4;
            })
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

        //number of sons y axis
        var y2 = d3.scale.linear()
            .range([canvasHeight - padding, padding])
            .domain([0, 10]);
        var yAxis2 = d3.svg.axis()
            .scale(y2)
            .orient("left")
            .tickValues([0, 1, 2, 3, 4, 5, 6, 7])
        genG.append("g")
            .attr("class", "x axis")
            .attr("transform", d3.translate(rectWidth, 0))
            .call(yAxis2);

        //general y axis
        var y = d3.scale.linear()
            .range([canvasHeight - padding, padding])
            .domain([0, 100]);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .tickValues([0, 10, 20, 30, 40, 50, 60, 70])
        genG.append("g")
            .attr("class", "x axis")
            .attr("transform", d3.translate(0, 0))
            .call(yAxis);

        featureCanvas.selectAll(".node")
            .data(data)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + 0 + ")";
            })
            .each(function(d, i) {
                var statCanvas = d3.select(this);
                var errorBar = new d3.drawErrBar(statCanvas, d);
                errorBar.draw();
            })

    }
}
