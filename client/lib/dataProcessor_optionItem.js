Template.optionItem.dataProcessor = function() {
    var ret = {
        version: 0.1
    };

    var conf = Template.optionItem.configure;

    ret.getOption = function(malePeople, attr) {
        var vals = _.uniq(_.map(malePeople, function(d) {
            return d[attr];
        }));
        var xDomain = d3.extent(vals);
        switch (attr) {
            case 'SON_COUNT':
                return {
                    nBins: vals.length,
                    range: xDomain,
                    svgStr: attr,
                    isConti: false,
                };
            case 'birthyear':
                return {
                    isConti: true,
                    svgStr: attr,
                    // range: xDomain,
                };
            case 'lastage':
                return {
                    isConti: true,
                    svgStr: attr,
                    range: [0, 100],
                };
            case 'f_bir_age':
                return { 
                    isConti: true, 
                    svgStr: attr,
                    range:[0, 100], 
                    filter:" ",
                };
            case 'l_bir_age':
                return { 
                    isConti: true, 
                    svgStr: attr,
                    range:[0, 100], 
                    filter:" ",
                };
        }

    }

    return ret;
}();
