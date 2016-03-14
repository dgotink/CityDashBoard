//go to https://bost.ocks.org/mike/chart/ 
//https://www.toptal.com/d3-js/towards-reusable-d3-js-charts
//for more explanations
function LineChart(){
    //All the options that are accesible to the caller
    var svgWidth = 800;
    var svgHeight = 250;
    var padding = 25;
    var data = [];
    
    var updateWidth;
    var updateHeight;
    var updateData;
    
    function chart(selection){
        selection.each(function() { 
        //Make the map of the data
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
    
        //Line function for transition (sets all the y values on the x axis (svgHeight - padding)
        var transline = d3.svg.line().interpolate("monotone")
            .x(function(d){ return xScale(d.x); })
            .y(function(d){ return svgHeight - padding; })
    
        //Line function
        var line = d3.svg.line().interpolate("monotone")
            .x(function(d){ return xScale(d.x); })
            .y(function(d){ return yScale(d.y); })
									 
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
                .attr("width", function() { return svgWidth/14 ; })         //there is no algorithm or formula for these values, just trial and error
                .attr("height", function() { return svgHeight/6; })
                .attr("x", function() { return svgWidth * 0.92; })
                .attr("y", function() { return svgHeight * 0.03; })
                .attr("fill", "rgb(0,0,0)")
                .on('click', function(d) { swap(d); });	
        }
            
        //Axis functions
        svg.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0, " + (svgHeight - padding) + ")")
            .call(xAxis);
		   
        svg.append("g")
            .attr("class", "axis y")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        var container = svg.selectAll('g.line')
                .data(data);
        
        //enter
        container.enter().append('g')
            .attr('stroke', function(d) { return d.Color; })
            .attr('class', 'line');
	
        //Draw the lines    
        container.selectAll('path')
            .data(function(d) { return [d.Data]; }) // continues the data from the pathContainer
            .enter().append('path')
            .attr('d', transline)
            .transition().duration(1500)
            .attr('d', line);
		
        // Add circles
        container.selectAll('circle')
            .data(function(d) { return d.Data; })
            .enter().append('circle')
            .attr('cx', function (d) { return xScale(d.x); })
            .attr('cy', svgHeight - padding)
            .attr('r', 5)
            .transition().duration(1500)
            .attr('cy', function (d) { return yScale(d.y); });
    
        //update functions
        updateWidth = function() {
            xScale.range([padding, svgWidth - padding]);
            svg.transition().duration(1000).attr('width', svgWidth);
        };
        
        updateHeight = function() {
            yScale.range([svgHeight - padding, padding]);
            svg.transition().duration(1000).attr('height', svgHeight);
        };
        
        updateData = function() {
            map = data.map(function (d) { return d.Data; });
            
            //update the scale
            xExtents = d3.extent(d3.merge(map), function (d) { return d.x; });
            yExtents = d3.extent(d3.merge(map), function (d) { return d.y; });
            xScale.domain([xExtents[0], xExtents[1]]);
            yScale.domain([yExtents[0], yExtents[1]]);
            
            // Update the Axis
            var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8);
            var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);

            svg.selectAll('g.x.axis')
                .transition().duration(1500)
                .call(xAxis);

            svg.selectAll('g.y.axis')
                .transition().duration(1500)
                .call(yAxis);
        
            //container.remove();
                  
            container = svg.selectAll('g.line')
                .data(data, name)
                .attr('d', line);
        
            //UPDATE
            container.selectAll('path')
                .data(function(d) { return [d.Data]; })
                .transition().duration(1500)
                .attr('d', line);
        
             container.selectAll('circle')
                .data(function(d) { return d.Data; })
                .transition().duration(1500)
                .attr('cx', function (d) { return xScale(d.x); })
                .attr('cy', function (d) { return yScale(d.y); });
        
            //ENTER
            container.enter().append('g')
                .attr('stroke', function(d) { return d.Color; })
                .attr('class', 'line');
	
            container.selectAll('path')
                .data(function(d) { return [d.Data]; }) // continues the data from the pathContainer
                .enter().append('path')
                .attr('d', transline)
                .transition().duration(1500)
                .attr('d', line);
              
            container.selectAll('circle')
                .data(function(d) { return d.Data; })
                .enter().append('circle')
                .attr('cx', function (d) { return xScale(d.x); })
                .attr('cy', svgHeight - padding)
                .attr('r', 5)
                .transition().duration(1500)
                .attr('cy', function (d) { return yScale(d.y); });
        
            //EXIT
            container.exit().remove();
                
            };
        });  
    }
    
    chart.data = function(value) {
    	if (!arguments.length) return data;
    	data = value;
    	if (typeof updateData === 'function') updateData();
    	return chart;
    };
        
    chart.width = function(value) {
        if (!arguments.length) return svgWidth;
        svgWidth = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
    };
 
    chart.height = function(value) {
        if (!arguments.length) return svgHeight;
        svgHeight = value;
        if (typeof updateHeight === 'function') updateHeight();
        return chart;
    };
 
    chart.padding = function(value) {
        if (!arguments.length) return padding;
        padding = value;
        return chart;
    };
    
    //because binding the data by index will not work, we bind the data by name. this funcion is called for the keys
    function name(d){
        return d.Name;
    }
    
    return chart;
}  