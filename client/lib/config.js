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
    attrs: ['f_bir_age', 'l_bir_age', 'lastage', 'sonCountFix', 'POSITION'],
    involvedNodes:[],
}

Template.header.configure = {

}

Template.option.configure = {
    // attributeList:["POSITION","SON_COUNT","birthorder","birthyear","cluster","district","ever_married","f_bir_age","f_bir_year","f_mar_age","f_mar_year","fatherid","founderid","has_son","householdid","l_bir_age","l_bir_year","lastage","personid","region","village"],
    attributeList: ["lastage", "birthyear", "f_bir_age", "l_bir_age"],
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
    clusters: [{ description: 'all', order: 0 }],
    clusterColors: ['#b2df8a', '#a6cee3', '#ffff99', '#fdbf6f', '#cab2d6', '#fb9a99', '#fde0ef'],
    clusterShadeColors: ['#33a02c', '#1f78b4', '#b15928', '#ff7f00', '#6a3d9a', '#e31a1c', '#8e0152'],
    sankey: {
        nodeWidth: 40,
        padding: 10,
        margin: 5,
    },
    freqPatterns: {
        margin: 5,
        padding: 2,
    },
    graidentColorDomain: { 
        "lean": [-0.8333333333333334, 0, 0.8333333333333334], 
        "count": [1, 25610], 
        "population": [2, 328], 
    },
    graidentColorRange: { 
        "lean": ['#b35806', '#ffffff', '#542788'], 
        "count": ['#fff7f3', '#49006a'], 
        "population": ['#fff7f3', '#49006a'], 
    },
    graidentColorScale: { 
        "lean": d3.scale.linear(), 
        "count": d3.scale.log(), 
        "population": d3.scale.sqrt(),
    }

}

Template.optionItem.configure = {
    clusterRange: {},
}

// Template.structureItem.configure = {
//     pattern:{
//         width:50,
//         height:50,
//         margin:5,
//     },
// }

Template.clusterWindow.configure = {
    labelPart: 0.1,
    chartPart: 0.9,
    oneLineHeight: 100,
    lineMarginTop: 30,
    svgBtn: {
        halfY: 15,
        width: 100,
        round: 15,
    },
    clusterPreview: {
        height: 30,
        width: 300,
        round: 5,
    }
}

Template.matrix.configure = {
    circleR: 2,
    duration: 500,
    treePadding: 5,
    outerMargin: 5,
    margin: 10,
    labelPart: 25,
    attrConf: {
        lastage: {
            range: [0, 100]
        },
        f_bir_age: {
            range: [0, 100]
        },
        l_bir_age: {
            range: [0, 100]
        },
        birthyear: {
            range: [1675, 1909]
        },
    },
    plotMargin: {
        top: 5,
        left: 40,
        right: 40,
        bottom: 50,
    },
    groupMargin: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 25,
    },
    targetMargin: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
    },
    attrs: ['lastage', 'f_bir_age', 'l_bir_age', 'birthyear'],
    showME:false,
    captionMapping:{
        f_bir_age:'First Birth Age',
        l_bir_age:'Last Birth Age',
        lastage:'Last Age',
        sonCountFix:'Number of Sons',
        POSITION:'Position'
    }
}
