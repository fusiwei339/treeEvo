d3.treemap_algo = function(arr_input, rect_input) {

    var result = [];
    var sum = function(arr) {
        var ret = 0;
        var i = arr.length;
        while (i--) ret += arr[i].freq;
        return ret;

    }

    var bisect = function(arr) {
        if (arr.length == 2)
            return {
                a: [arr[0]],
                b: [arr[1]]
            };

        var a = [],
            b = [];

        var halfSum = sum(arr) / 2;
        var idx = -1;
        var accu = 0;
        for (let i = 0, len = arr.length; i < len - 1; i++) {
            if (accu < halfSum) {
                var elem = arr[i];
                a.push(elem)
                accu += elem.freq;
                idx = i;
            }
        }
        b = arr.slice(idx+1);

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
        return sum(arr1) / (sum(arr1) + sum(arr2));
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
        if (arr.length < 1) return;
        if (arr.length == 1) {
            var ret = {};
            ret.obj= arr[0];
            ret.rect = rect;
            result.push(ret);
            return;
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
