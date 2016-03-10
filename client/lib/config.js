Template.flow.configure = {
    margin: 10,
    padding: 5,
    flowPart: 0.7,
    featurePart: 0.3,
    nodePadding: 5,
    nodeWidth: 16,
    animationDur: 800,
    demographicAttr_text: ['first marriage', 'first birth', 'last birth', 'death age', 'SON_COUNT'],
    demographicAttr: ['f_mar_age', 'f_bir_age', 'l_bir_age', 'lastage', 'SON_COUNT'],
    rectWidth: 153,
    //declared while running
    colorScale: undefined,
    sankeyNodes: undefined,
    sankeyEdges: undefined,
    generations: undefined,
    clusters: undefined,
    malePeopleObj_ori: undefined,
    malePeopleObj_father: undefined,

}

Template.header.configure = {

}

Template.option.configure = {
    // attributeList:["POSITION","SON_COUNT","birthorder","birthyear","cluster","district","ever_married","f_bir_age","f_bir_year","f_mar_age","f_mar_year","fatherid","founderid","has_son","householdid","l_bir_age","l_bir_year","lastage","personid","region","village"],
    attributeList: ["SON_COUNT", "birthyear", "lastage", "f_bir_age", "l_bir_age"],
    svgHeight: 100,
    animationDur: 800,
    barPadding: 2,
    margin: {
        top: 8,
        left: 35,
        right: 15,
        bottom: 20,
    },
    filter: {},
    clusters: [{description:'all', order:0}],
    clusterColors:['#b2df8a','#a6cee3','#ffff99','#fdbf6f','#cab2d6','#fb9a99',],
    clusterShadeColors:['#33a02c','#1f78b4','#b15928','#ff7f00','#6a3d9a','#e31a1c'],
}
