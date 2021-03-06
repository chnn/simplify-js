/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { "use strict";

// Expects points to be in format [x, y]. To suit your point format, run 
// search/replace for '[0]' and '[1]'

// Square distance from a point to a segment
function _getSqSegDist(p, p1, p2) {

    var x = p1[0],
        y = p1[1],
        dx = p2[0] - x,
        dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2[0];
            y = p2[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
}

// Simplification using optimized Douglas-Peucker algorithm with recursion elimination
function _simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,
        MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
        markers = new MarkerArray(len),
        first = 0,
        last = len - 1,
        stack = [],
        newPoints = [],
        i, maxSqDist, sqDist, index;

    markers[first] = markers[last] = 1;

    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = _getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            markers[index] = 1;
            stack.push(first, index, index, last);
        }

        last = stack.pop();
        first = stack.pop();
    }

    for (i = 0; i < len; i++) {
        if (markers[i]) {
            newPoints.push(points[i]);
        }
        else if (isNaN(points[i][1])) {
            newPoints.push(points[i]);
        }
    }

    return newPoints;
}

function simplify(points, tolerance) {

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    points = _simplifyDouglasPeucker(points, sqTolerance);

    return points;
}

// Export as AMD module / Node module / browser variable
if (typeof define === 'function' && define.amd) {
    define(function() {
        return simplify;
    });
} else if (typeof module !== 'undefined') {
    module.exports = simplify;
} else {
    window.simplify = simplify;
}

})();
