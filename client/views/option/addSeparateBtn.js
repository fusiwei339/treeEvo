d3.addSeparateBtn = function(svg, partitionY, svgWidth) {

    var conf = Template.clusterWindow.configure;
    var dataProcessor = Template.clusterWindow.dataProcessor;
    var optionItem_conf = Template.optionItem.configure;
    var items = dataProcessor.getClusterData(optionItem_conf.clusterRange);

    svg.append('path')
        .attr('d', geom.path.begin()
            .move_to(0, partitionY)
            .line_to(svgWidth, partitionY)
            .end()
        )
        .attr('class', 'partition')

    svg.append('rect')
        .attr('x', svgWidth * 0.8)
        .attr('y', partitionY - conf.svgBtn.halfY)
        .attr('rx', conf.svgBtn.round)
        .attr('ry', conf.svgBtn.round)
        .attr('width', conf.svgBtn.width)
        .attr('height', conf.svgBtn.halfY * 2)
        .attr('class', 'partition partitionBtn')
        .on('click', clickBtn)
    svg.append('text')
        .attr('x', svgWidth * 0.8 + 12)
        .attr('y', partitionY - conf.svgBtn.halfY + 20)
        .text('Permutation')
        .attr('class', 'partitionText')
        .on('mouseover', function() {
            svg.selectAll('.partitionBtn').style('fill', '#d8d8d8')
        })
        .on('mouseout', function() {
            svg.selectAll('.partitionBtn').style('fill', '#fff')
        })
        .on('click', clickBtn)


    function clickBtn() {
        var ret = [];

        function dfs(i, arr) {
            if (i === items.length) {
                ret.push(arr);
                return;
            }
            _.each(items[i].value, function(d, j) {
                var arrTemp = d3.deepCopyArr(arr);
                arrTemp.push(d);
                dfs(i + 1, arrTemp);
            })
        }
        dfs(0, []);

        var clusters = dataProcessor.formatClusters(ret);
        Session.set('clusterPreview', clusters);
    }
}
