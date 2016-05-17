// returns slope, intercept and r-square of the line
// code from Ben Van Dyke at http://bl.ocks.org/benvandyke/8459843
function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };
		
    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
	.reduce(reduceSumFunc);
		
    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
	.reduce(reduceSumFunc);
			
    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
	.reduce(reduceSumFunc);
			
    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
		
    return [slope, intercept, rSquare];
}