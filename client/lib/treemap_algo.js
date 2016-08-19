d3.treemap_algo = function(arr_input, rect_input) {

    var result = [];

    var bisect = function(arr) {
        var a = [],
            b = [];
        arr.sort(function(a, b) {
            return +b - (+a);
        })
        while (arr.length > 0) {
            var elem = arr.shift();
            if (d3.sum(a) >= d3.sum(b)) {
                b.push(elem)
            } else {
                a.push(elem)
            }
        }
        return {
            a: a,
            b: b
        }
    }
    var getDirection = function(height, width) {
        if (height >= width) return 'hori';
        else return 'verti';
    }
    var getRatio = function(arr1, arr2) {
        return d3.sum(arr1) / (d3.sum(arr1) + d3.sum(arr2));
    }

    var divideArea = function(rect, twoArr, direct) {
        var rect1 = {},
            rect2 = {};
        var ratio = getRatio(twoArr.a, twoArr.b);
        if (direct === "hori") {
            rect1.top = rect.top;
            rect1.left = rect.left;
            rect1.width = rect.width;
            rect1.height = ratio * rect.height;

            rect2.top = rect.top + rect1.height;
            rect2.left = rect.left;
            rect2.width = rect.width;
            rect2.height = (1 - ratio) * rect.height;
        } else {
            rect1.top = rect.top;
            rect1.left = rect.left;
            rect1.height = rect.height;
            rect1.width = ratio * rect.width;

            rect2.top = rect.top;
            rect2.left = rect.left + rect1.width;
            rect2.width = (1 - ratio) * rect.width;
            rect2.height = rect.height;
        }
        return {
            p1: {
                rect: rect1,
                arr: twoArr.a
            },
            p2: {
                rect: rect2,
                arr: twoArr.b
            },
        }
    }
    var slice = function(rect, arr) {
        if (arr.length == 1) {
            var ret = {};
            ret.text = arr[0];
            ret.rect = rect;
            result.push(ret);
        } else {
            var direct = getDirection(rect.height, rect.width);
            var twoArr = bisect(arr);
            var twoRegions = divideArea(rect, twoArr, direct)
            var first = twoRegions.p1,
                second = twoRegions.p2;

            slice(first.rect, first.arr)
            slice(second.rect, second.arr)
        }
    };

    slice(rect_input, arr_input);
    return result;
}