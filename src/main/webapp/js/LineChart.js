//go to https://bost.ocks.org/mike/chart/ for a detailed explanation
function LineChart(){
    //Width & height
    var svgWidth = 800;
    var svgHeight = 250;
    var padding = 25;
    
    function chart(selection){
        selection.each(function(data) { 
         //Make the map
        var map = data.map(function (d) { return d.Data; });
                
        //Variables needed for scale
        var xExtents = d3.extent(d3.merge(map), function (d) { return d.x; });
        var yExtents = d3.extent(d3.merge(map), function (d) { return d.y; });
        
		
        //Scales
        var xScale = d3.scale.linear()
            .domain([xExtents[0], xExtents[1]])
            .range([padding, svgWidth - padding]);
							 
        var yScale = d3.scale.linear()
            .domain([yExtents[0], yExtents[1]])
            .range([svgHeight - padding, padding]);
							 
        //Axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(8);
						  
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(6);
									 
        //Svg						 
        var svg = d3.select(this)
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("class", "svgbox");
					
        //Axis functions
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (svgHeight - padding) + ")")
            .call(xAxis);
		   
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        var pathContainers = svg.selectAll('g.line')
            .data(map);
	
        pathContainers.enter().append('g')
            .attr('class', 'line');
	
        //draw the lines    
        pathContainers.selectAll('path')
            .data(function(d) { return [d]; }) // continues the data from the pathContainer
            .enter().append('path')
            .attr('d', d3.svg.line()
                .x(function (d) { return xScale(d.x); })
                .y(function (d) { return yScale(d.y); })
                .interpolate("monotone")
            );
		
        // add circles
        pathContainers.selectAll('circle')
            .data(function(d) { return d; })
            .enter().append('circle')
            .attr('cx', function (d) { return xScale(d.x); })
            .attr('cy', function (d) { return yScale(d.y); })
            .attr('r', 5); 
    
        });
        
    }
    
    chart.width = function(value) {
        if (!arguments.length) return svgWidth;
        svgWidth = value;
        return chart;
    	};
 
    	chart.height = function(value) {
            if (!arguments.length) return svgHeight;
            svgHeight = value;
            return chart;
    	};
 
        chart.padding = function(value) {
            if (!arguments.length) return padding;
            padding = value;
            return chart;
    	};
    
    return chart;
    
}            
                