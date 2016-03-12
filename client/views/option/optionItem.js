Template.optionItem.rendered = function() {
    var self = this;
    var attrStat;
    var svgDom = self.find('svg');
    var svgStr = $(svgDom).attr('itemAttr');

    //draw svg
    Deps.autorun(function() {
        Session.get('malePeopleObj_ready');
        var flowConf = Template.flow.configure;
        var conf = Template.option.configure;
        var dataProcessor = Template.optionItem.dataProcessor;

        if (!flowConf.malePeople) return;

        var malePeople = flowConf.malePeople;

        var svg = d3.select(svgDom)
        svg.selectAll('*').remove();

        var option = dataProcessor.getOption(malePeople, svgStr);

        attrStat = new d3.attrStat(svg, malePeople)
            .width($(svgDom).width())
            .height($(svgDom).height())
            .option(option)
            .draw()
    })

    Deps.autorun(function() {
        Session.get('clearBtn');
        Session.get('clearBtn' + svgStr);
        if (attrStat) {
            attrStat.clearDots();
            var conf = Template.optionItem.configure;
            conf.clusterRange[svgStr] = attrStat.dots;
        }
    })

    Deps.autorun(function() {
        Session.get('clusterBtn');
    })

    Deps.autorun(function() {
        Session.get('clusterRangeReady')
    })
}


Template.optionItem.helpers({})

Template.optionItem.events({
    'click label': function(e, template) {
        var itemAttr=template.data.itemAttr;
        Session.set('clearBtn' + itemAttr, new Date());
        // var id=$(e.currentTarget).attr('id');
        // var itemAttr=template.data.itemAttr;
        // id=id.replace(itemAttr, '');
        // if(id==='remove'){
        //     console.log('remove botton')
        // }else{
        // }
    }
});
