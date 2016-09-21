/**
 * Created by conglei on 20/2/14.
 */


Array.prototype.remByVal = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

Array.prototype.remObjByKey = function(key, val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][key] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}
Array.prototype.aggregate = function(num) {
    var length = this.length;
    var newArray = [];
    var sum = 0;
    for (var i = 0; i < length; i++) {
        sum += this[i];
        if ((i + 1) % num == 0) {
            newArray.push(sum / num);
            sum = 0;
        }
    }
    if (length % num != 0) newArray.push(sum / length % num);
    return newArray;
};

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

d3.translate = function(x, y) {
    return geom.transform.begin().translate(x, y).end();
}

d3.isOdd = function(num) {
    return num % 2;
}

//d3.transform is better
d3.transform2JSON = function(str) {
    // let's work with transform = "translate(6,5),scale(3,3)" as specified.
    var result = {}
    var splitList = str.split(/\W/);
    // now splitList is ["translate", "6", "5", "", "scale", "3", "3", ""]
    for (var t = 0; t < splitList.length; t += 4) {
        var temp = splitList[t]
        result[temp] = {}
        result[temp].x = splitList[t + 1];
        result[temp].y = splitList[t + 2];
    }
    return result;
}

d3.getBBox = function(selector) {
    var bbox = selector.getBoundingClientRect()
    var ret = {
        bottom: bbox.bottom,
        height: bbox.height,
        left: bbox.left,
        right: bbox.right,
        top: bbox.top,
        width: bbox.width,
    }
    return ret;
}

d3.expandCells = function(cells, attr) {
    var arr = [];
    _.map(cells, function(d) {
        arr = d[attr].reduce(function(coll, item) {
            coll.push(item);
            return coll;
        }, arr);
    })
    return arr;
}

d3.unionKey = function(cells, key) {
    var postsTemp = d3.expandCells(cells, 'posts');
    var keys = _.keys(_.groupBy(postsTemp, function(d) {
        return d[key];
    }));
    return keys;
};
// d3.unionThreads = function(cells) {
//     var postsTemp = d3.expandCells(cells, 'posts');
//     var threadIds = _.keys(_.groupBy(postsTemp, function(d) {
//         return d.threadId;
//     }));
//     return threadIds;
// };

// d3.intersectThreads = function(cells) {
//     var threadsPerCell = _.map(cells, function(cell) {
//         var posts = cell.posts;
//         return _.keys(_.groupBy(posts, function(d) {
//             return d.threadId;
//         }));
//     })
//     var ret = threadsPerCell[0]
//     _.each(threadsPerCell, function(threads) {
//         ret = _.intersection(ret, threads);
//     })
//     return ret;
// }

d3.intersectKey = function(cells, key) {
    var keysPerCell = _.map(cells, function(cell) {
        var posts = cell.posts;
        return _.keys(_.groupBy(posts, function(d) {
            return d[key];
        }));
    })
    var ret = keysPerCell[0]
    _.each(keysPerCell, function(key) {
        ret = _.intersection(ret, key);
    })
    return ret;
}

d3.removeSpaces = function(str) {
    return str.replace(/\s+/g, '');
}

d3.googleColor= d3.scale.ordinal()
    // .range(['#1f77b4','#fc8d62','#8da0cb','#e78ac3','#a6d854'])
    .range(['#ff7f0e', '#2ca02c', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'])

d3.parsePath = function(path) {
    var list = path.pathSegList;
    var res = [];
    for (var i = 0; i < list.length; i++) {
        var cmd = list[i].pathSegTypeAsLetter;
        var sub = [];
        switch (cmd) {
            case "C":
            case "c":
                sub.unshift(list[i].y2);
                sub.unshift(list[i].x2);
            case "Q":
            case "q":
                sub.unshift(list[i].y1);
                sub.unshift(list[i].x1);
            case "M":
            case "m":
            case "L":
            case "l":
                sub.push(list[i].x);
                sub.push(list[i].y);
                break;
            case "A":
            case "a":
                sub.push(list[i].r1);
                sub.push(list[i].r2);
                sub.push(list[i].angle);
                sub.push(list[i].largeArcFlag);
                sub.push(list[i].sweepFlag);
                sub.push(list[i].x);
                sub.push(list[i].y);
                break;
            case "H":
            case "h":
                sub.push(list[i].x);
                break;
            case "V":
            case "v":
                sub.push(list[i].y);
                break;
            case "S":
            case "s":
                sub.push(list[i].x2);
                sub.push(list[i].y2);
                sub.push(list[i].x);
                sub.push(list[i].y);
                break;
            case "T":
            case "t":
                sub.push(list[i].x);
                sub.push(list[i].y);
                break;
        }
        sub.unshift(cmd);
        res.push(sub);
    }
    return res;
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};
d3.lineDistance = function(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
};
d3.deepCopyArr = function(arr) {
    var ret = _.map(arr, function(obj) {
        return $.extend(true, {}, obj);
    })
    return ret;
}
