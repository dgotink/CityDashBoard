//go to https://bost.ocks.org/mike/chart/ 
//https://www.toptal.com/d3-js/towards-reusable-d3-js-charts
//for more explanations
function LineChart(){
    //All the options that are accesible to the caller
    var svgWidth = 800;
    var svgHeight = 350;
    var padding = 25;
    var data = [];
    var distortion = true;
    
    var updateWidth;
    var updateHeight;
    var updateData;    
    
    //Defining time format
    var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
    
    function chart(selection){
        selection.each(function() { 
        //Variables needed for scale
        var map = data.map(function (d) { return d.data; });
        var merged = d3.merge(map);
        var mapX = merged.map(function(d) { return timeFormat.parse(d.x); });
        var mapY = merged.map(function(d) { return d.y; });
        var xExtent = d3.extent(mapX);
        var yExtent = d3.extent(mapY);
        
        //Scales
        var xScale = d3.fisheye.scale(d3.time.scale.utc)
            .domain([xExtent[0], xExtent[1]])
            .range([padding + padding, svgWidth - padding]);
							 
        var yScale = d3.fisheye.scale(d3.scale.linear)
            .domain([yExtent[0], yExtent[1]])
            .range([svgHeight - padding - padding, padding]);

        //Sliderscales
        var xSliderScale = d3.scale.linear()
            .domain([xExtent[0], xExtent[1]])
            .range([padding + padding , svgWidth - padding])
            .clamp(true);
							 
        var ySliderScale = d3.scale.linear()
            .domain([yExtent[0], yExtent[1]])
            .range([svgHeight - padding - padding, padding])
            .clamp(true);
    
        //Brushes
        var xBrush = d3.svg.brush()
            .x(xSliderScale)
            .on("brush", brushedX);
            
        var yBrush = d3.svg.brush()
            .y(ySliderScale)
            .on("brush", brushedY);
							 
        //Axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5);
    					  
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
    
        var xSliderAxis = d3.svg.axis()
            .scale(xSliderScale)
            .orient("bottom")
            .ticks(0);
						  
        var ySliderAxis = d3.svg.axis()
            .scale(ySliderScale)
            .orient("left")
            .ticks(0);
    
        //Line function for transition (sets all the y values on the x axis (svgHeight - padding)
        var transline = d3.svg.line().interpolate("basis")
            .x(function(d){ return xScale(timeFormat.parse(d.x)); })
            .y(function(){ return svgHeight - padding - padding; });
    
        //Line function
        var line = d3.svg.line().interpolate("basis")
            .x(function(d){ return xScale(timeFormat.parse(d.x)); })
            .y(function(d){ return yScale(d.y); });
									 
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
                .attr("width", function() { return svgWidth/14 ; })         //there is no algorithm or formula for these values, just values that seemed to work
                .attr("height", function() { return svgHeight/6; })
                .attr("x", function() { return svgWidth * 0.92; })
                .attr("y", function() { return svgHeight * 0.03; })
                .attr("fill", "rgb(0,0,0)")
                .on('click', function(d) { swap(d); });	
        }
        
        //add a button to turn the distortion on or off
        svg.append("rect")
            .attr("width", function() { return svgWidth/14 ; })
            .attr("height", function() { return svgHeight/6; })
            .attr("x", function() { return svgWidth * 0.92; })
            .attr("y", function() { return svgHeight * 0.03 + 5 + svgHeight/6; })
            .attr("fill", "rgb(0,255,255)")
            .on("click", function() { 
                if(distortion) {
                    distortion = false;
                    updateDistortion();
                }
                else {
                    distortion = true;
                    updateDistortion(true);
                }
        });
            
        //Axis functions
        svg.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0, " + (svgHeight - padding - padding) + ")")
            .call(xAxis);
		   
        svg.append("g")
            .attr("class", "axis y")
            .attr("transform", "translate(" + padding * 2 + ",0)")
            .call(yAxis);
    
        svg.append("g")
            .attr("class", "slider x")
            .attr("transform", "translate(0, " + (svgHeight - padding) + ")")
            .call(xSliderAxis)
            .select(".domain")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");
    
        svg.append("g")
            .attr("class", "slider y")
            .attr("transform", "translate(" + padding + ",0)")
            .call(ySliderAxis)
            .select(".domain")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");
    
        //Sliders
        var xSlider = svg.append("g")
            .attr("class", "slider")
            .call(xBrush);
        
         var ySlider = svg.append("g")
            .attr("class", "slider")
            .call(yBrush);
            
        var xHandle = xSlider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(" + (padding + padding) + ", " + (svgHeight - padding) + ")")
            .attr("r", 9);
    
        var yHandle = ySlider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(" + padding + "," + padding  + ")")
            .attr("r", 9);

        //make the container for the lines and bind the data
        var container = svg.selectAll('g.line')
                .data(data);
        
        //call the events once to set the sliders on the 0 positions (this will not be a programmatic event so go in the else part
        xSlider.call(xBrush.event);
        ySlider.call(yBrush.event);
        
        //enter
        container.enter().append('g')
            .attr('stroke', function(d) { return d.color; })
            .attr('class', 'line');
	
        //Draw the lines    
        container.selectAll('path')
            .data(function(d) { return [d.data]; }) // continues the data from the pathContainer
            .enter().append('path')
            .attr('d', transline)
            .transition().duration(1500)
            .attr('d', line);
		
        // Add circles
        /*container.selectAll('circle')
            .data(function(d) { return d.data; })
            .enter().append('circle')
            .attr('cx', function (d) { return xScale(timeFormat.parse(d.x)); })
            .attr('cy', svgHeight - padding - padding)
            .attr('r', 2)
            .transition().duration(1500)
            .attr('cy', function (d) { return yScale(d.y); });

        container.selectAll('circle')
            .append("svg:title")
            .text(function(d) { return d.x + "--" + d.y ; })
            .attr("x", function (d) { return xScale(timeFormat.parse(d.x)); })
            .attr("y", function (d) { return yScale(d.y); });*/
        
        //update the carthesian distortian according to the new x value
        function brushedX() {
            if (d3.event.sourceEvent) { // not a programmatic event
                var valueSlider = xSliderScale.invert(d3.mouse(this)[0]);
                var valueDistort = d3.mouse(this)[0];
                xHandle.attr("cx", xSliderScale(valueSlider) - padding - padding);
                xScale.distortion(3).focus(valueDistort);
                container.selectAll('path')
                    .attr('d', line);
                container.selectAll('circle')
                    .attr('cx', function (d) { return xScale(timeFormat.parse(d.x)); });
                svg.selectAll('g.x.axis')
                    .call(xAxis);
            } else {
                xScale.distortion(3).focus(xScale.range()[0]);
                svg.selectAll('g.x.axis')
                    .transition().duration(1500)
                    .call(xAxis);
            }   
        };
        //update the carthesian distortion according to the new y value
        function brushedY() {
            if (d3.event.sourceEvent) { // not a programmatic event
                valueSlider = ySliderScale.invert(d3.mouse(this)[1]);
                valueDistort = d3.mouse(this)[1];
                yHandle.attr("cy", ySliderScale(valueSlider) - padding);
                yScale.distortion(3).focus(valueDistort);
                container.selectAll('path')
                    .attr('d', line);
                container.selectAll('circle')
                    .attr('cy', function (d) { return yScale(d.y); });
                svg.selectAll('g.y.axis')
                    .call(yAxis);
            } else {
                yScale.distortion(3).focus(yScale.range()[1]);
                svg.selectAll('g.y.axis')
                    .call(yAxis);
            }
        };
        
        //TODO FIND A WAY TO ARRANGE THE TICKS ACCORDING TO THE CARTHESIAN DISTORTION
        //MAYBE MODULO SPACE OR SOMETHING LIKE THAT

        //update functions
        updateWidth = function() {
            xScale.range([padding, svgWidth - padding]);
            svg.transition().duration(1000).attr('width', svgWidth);
        };
        
        updateHeight = function() {
            yScale.range([svgHeight - padding, padding]);
            svg.transition().duration(1000).attr('height', svgHeight);
        };
        
        function updateDistortion() {
            if(!distortion){
                //Scales
                xScale = d3.time.scale.utc()
                    .domain([xExtent[0], xExtent[1]])
                    .range([padding, svgWidth - padding]);
							 
                yScale = d3.scale.linear()
                    .domain([yExtent[0], yExtent[1]])
                    .range([svgHeight - padding, padding]);
            
                // Update the Axis
                xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8);
                yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);
            
                svg.selectAll('g.x.axis')
                    .transition().duration(1500)
                    //.attr("transform", "translate(0, " + (svgHeight - padding) + ")")
                    .call(xAxis);

                svg.selectAll('g.y.axis')
                   .transition().duration(1500)
                   //.attr("transform", "translate(" + padding + ",0)")
                   .call(yAxis);    
            
                svg.selectAll("g.slider").remove();
                svg.selectAll("g.handle").remove();
                svg.selectAll("g.halo").remove();
 
            } else {
                //Scales
                xScale = d3.fisheye.scale(d3.time.scale.utc)
                    .domain([xExtent[0], xExtent[1]])
                    .range([padding + padding, svgWidth - padding]);
							 
                yScale = d3.fisheye.scale(d3.scale.linear)
                    .domain([yExtent[0], yExtent[1]])
                    .range([svgHeight - padding - padding, padding]); 
            
                svg.append("g")
                    .attr("class", "slider x")
                    .attr("transform", "translate(0, " + (svgHeight - padding) + ")")
                    .call(xSliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");
    
                svg.append("g")
                    .attr("class", "slider y")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(ySliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");
    
                //Sliders
                xSlider = svg.append("g")
                    .attr("class", "slider")
                    .call(xBrush);
        
                ySlider = svg.append("g")
                    .attr("class", "slider")
                    .call(yBrush);
            
                xHandle = xSlider.append("circle")
                    .attr("class", "handle")
                    .attr("transform", "translate(" + (padding + padding) + ", " + (svgHeight - padding) + ")")
                    .attr("r", 9);
    
                yHandle = ySlider.append("circle")
                    .attr("class", "handle")
                    .attr("transform", "translate(" + padding + "," + padding  + ")")
                    .attr("r", 9);
            
                xSlider.call(xBrush.event);
                ySlider.call(yBrush.event);
                
                // Update the Axis
                xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8);
                yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);
            
                svg.selectAll('g.x.axis')
                    .transition().duration(1500)
                    .attr("transform", "translate(0, " + (svgHeight - padding - padding) + ")")
                    .call(xAxis);

                svg.selectAll('g.y.axis')
                   .transition().duration(1500)
                   .attr("transform", "translate(" + padding *2+ ",0)")
                   .call(yAxis);    
            }
            updateData();
        };
        
        updateData = function() {
            map = data.map(function (d) { return d.data; });
            merged = d3.merge(map);
            mapX = merged.map(function(d) { return timeFormat.parse(d.x); });
            mapY = merged.map(function(d) { return d.y; });
            xExtent = d3.extent(mapX);
            yExtent = d3.extent(mapY);
            
            //update the scale
            xScale.domain([xExtent[0], xExtent[1]]);
            yScale.domain([yExtent[0], yExtent[1]]);
            xSliderScale.domain([xExtent[0], xExtent[1]]);
            ySliderScale.domain([yExtent[0], yExtent[1]]);
            
            // Update the Axis
            var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8);
            var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);

           svg.selectAll('g.x.axis')
                    .transition().duration(1500)
                    //.attr("transform", "translate(0, " + (svgHeight - padding) + ")")
                    .call(xAxis);

                svg.selectAll('g.y.axis')
                   .transition().duration(1500)
                   //.attr("transform", "translate(" + padding + ",0)")
                   .call(yAxis);    
       
            //container.remove();
                  
            container = svg.selectAll('g.line')
                .data(data, name);
        
            //UPDATE
            container.selectAll('path')
                .data(function(d) { return [d.data]; })
                .transition().duration(1500)
                .attr('d', line);
        
            /*container.selectAll('circle')
                .data(function(d) { return d.data; })
                .transition().duration(1500)
                .attr('cx', function (d) { return xScale(timeFormat.parse(d.x)); })
                .attr('cy', function (d) { return yScale(d.y); });*/
        
            //ENTER
            container.enter().append('g')
                .attr('stroke', function(d) { return d.color; })
                .attr('class', 'line');
	
            container.selectAll('path')
                .data(function(d) { return [d.data]; }) // continues the data from the container
                .enter().append('path')
                .attr('d', transline)
                .transition().duration(1500)
                .attr('d', line);
              
            /*container.selectAll('circle')
                .data(function(d) { return d.data; })
                .enter().append('circle')
                .attr('cx', function (d) { return xScale(timeFormat.parse(d.x)); })
                .attr('cy', svgHeight - padding - padding)
                .attr('r', 2)
                .transition().duration(1500)
                .attr('cy', function (d) { return yScale(d.y); });*/
        
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
    
    //because binding the data by index will not work, we bind the data by name. this funcion is called for the keys (names)
    function name(d){
        return d.name;
    }
    
    return chart;
}  