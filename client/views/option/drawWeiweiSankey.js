d3.drawWeiweiSankey = class {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
    }

    height(val) {
        this._height = val;
        return this;
    }
    width(val) {
        this._width = val;
        return this;
    }

    draw() {
        var data = this.data;
        var svg = this.svg;
        var width = this._width;
        var height = this._height;
        var conf = Template.matrix.configure;
        var dataProcessor = Template.matrix.dataProcessor;
        var padding = 5;
        var maxPop = null;

        for (let i = 0, len = data.length; i < len; i++) {
            var temp = data[i];
            if (temp.depth === 1) {
                maxPop = Math.round(temp.count / temp.percent);
                break;
            }
        }

        function getY() {
            var nodeHeight = 30;

            let yScale = d3.scale.ordinal()
                .domain([1, 2, 3, 4, 5, 6, 7, 8, 9])
                .rangeBands([0, height])

            function sumFromZero(n) {
                return n * (n - 1) / 2;
            }

            data.forEach(function(node, i) {
                node.dy = nodeHeight + (node.depth - 1) * 10;
                var offset = node.depth > 1 ? (sumFromZero(node.depth) - 1) * 10 : 0
                node.y = yScale(node.depth) + offset;
            });
        }

        getY()

        var xScale = d3.scale.linear()
            .domain([0, 1])
            .range([0, width])


        svg.selectAll('.sankeyG')
            .data(data).enter()
            .append('g')
            .attr('class', 'sankeyG')
            .attr('transform', (d,i) => {
                // xScale.range([0, d.count / d.percent / maxPop * width])
                return d3.translate(xScale(d.accu), d.y)
            })
            .each(function(d, i) {
                // xScale.range([0, d.count / d.percent / maxPop * width])
                var canvas = d3.select(this);
                canvas.append('rect')
                    .attr('class', 'sankeyRect')
                    .attr('height', d => d.dy)
                    .attr('width', d => xScale(d.percent))

            })


    }

}
