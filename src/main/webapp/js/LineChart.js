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
    
        //if the id of the container is primitive, it can be added to the arr of the data of the collectedlinegraphbox
        //this will add a rect with a onclick event that swaps (add/remove) the data from the Data arr
        if(this.id === "PrimitiveLineGraphBox"){
            svg.append("rect")
                .data(data)
                .attr("width", function() { return svgWidth/14 ; })
                .attr("height", function() { return svgHeight/6; })
                .attr("x", function() { return svgWidth * 0.92; })
                .attr("y", function() { return svgHeight * 0.03; })
                .attr("fill", "rgb(0,0,0)")
                .on('click', function(d) { swap(d); });	
        
        }
            
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
            .data(data);
	
        pathContainers.enter().append('g')
            .attr('stroke', function(d) { return d.Color; })
            .attr('class', 'line');
	
        //Draw the lines    
        pathContainers.selectAll('path')
            .data(function(d) { return [d.Data]; }) // continues the data from the pathContainer
            .enter().append('path')
            .attr('d', d3.svg.line()
                .x(function (d) { return xScale(d.x); })
                .y(function (d) { return yScale(d.y); })
                .interpolate("monotone")
            );
		
        // Add circles
        pathContainers.selectAll('circle')
            .data(function(d) { return d.Data; })
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

                