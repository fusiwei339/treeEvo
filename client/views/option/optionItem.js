Template.optionItem.rendered = function() {
    var self = this;

    //draw svg
    Deps.autorun(function() {
        Session.get('malePeopleObj_ready');
        var flowConf = Template.flow.configure;
		var conf=Template.option.configure;
        var dataProcessor = Template.optionItem.dataProcessor;

        if (!flowConf.malePeopleObj_ori ||
            !flowConf.malePeople
        ) return;

        var malePeople = flowConf.malePeople;

    	var svgDom=self.find('svg');
        var svgStr = $(svgDom).attr('itemAttr');
        var svg=d3.select(svgDom)

        var option=dataProcessor.getOption(malePeople, svgStr);


        var attrStat=new d3.attrStat(svg, malePeople)
        	.width($(svgDom).width())
        	.height($(svgDom).height())
        	.option(option)
        	.draw()

    })
}


Template.optionItem.helpers({})

Template.optionItem.events({});
