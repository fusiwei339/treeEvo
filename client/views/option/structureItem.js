// Template.structureItem.rendered = function() {
//     var self = this;
//     var svgDom = self.find('svg');
//     var depth = +$(svgDom).attr('depth');

//     //draw svg
//     Deps.autorun(function() {
//         Session.get('malePeopleObj_ready');
//         Session.get('renewTabs')
//         var flowConf = Template.flow.configure;
//         var conf = Template.structureItem.configure;
//         var dataProcessor = Template.structureItem.dataProcessor;

//         if (!flowConf.malePeople || !flowConf.patternsObj) return;

//         var svg = d3.select(svgDom)
//         svg.selectAll('*').remove();

//         var data = flowConf.patternsObj[depth + ''];

//         var width = $(svgDom).width()
//         var height = $(svgDom).height()
//         new d3.drawFreqPatterns(svg, data)
//             .width(width)
//             .height(height)
//             .depth(depth)
//             .draw()

//     })

// }


// Template.structureItem.helpers({})

// Template.structureItem.events({
// });
