function herschreven() { 
    
    //variablen
    var width = 800,
        height = 350,
        padding = 25;

    var data = [];

    var distortion = ""; //empty, x, y or xy depending on where the distortion is
    
    var updateWidth,
        updateHeight,
        updateData;

    function chart(selection){
        selection.each(function() { 
            //the vars needed in the chart function (will be filled in later by subfunctions)
            //the data in X & Y
            var mapX,
                mapY;
            //the scales needed to scale the axis, datapoints    
            var xScale,
                yScale;
            //the scales needed to make the sliders for carthesian distortion  
            var xSliderScale,
                ySliderScale;
            //the axes to be displayed    
            var xAxis,
                yAxis;
            //the axes for the sliders to be displayed on
            var xSliderAxis,
                ySliderAxis;
            //the brushes for the carthesian distortion 
             var xBrush,
                 yBrush;
            //the sliders for the carthesian distortion
            var xSlider,
                ySlider;
            //the slider handles (which the user can move)
            var xHandle,
                yHandle;
            //the last known x, y slider value
            var lastX = 0,
                lastY = 0;       
            //the container which holds all the lines
            var container;
            
            //time parser
            var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
            
            //line methods
            var transline,
                line;
                
            //create the SVG
            var svg = d3.select(this)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "svgbox");
        
            //if the id of the container is primitive, it can be added to the arr of the data of the collectedlinegraphbox
            //this will add a rect with a onclick event that swaps (add/remove) the data from the Data arr
            if(this.id === "PrimitiveLineGraphBox"){
                svg.append("rect")
                    .data(data)
                    .attr("width", function() { return width/14 ; })         //there is no algorithm or formula for these values, just values that seemed to work
                    .attr("height", function() { return height/6; })
                    .attr("x", function() { return width * 0.92; })
                    .attr("y", function() { return height * 0.03; })
                    .attr("fill", "rgb(0,0,0)")
                    .on('click', function(d) { swap(d); });	
            }
            
            //add a button to turn the distortion on or off for x, y
            svg.append("rect")
                .attr("width", function() { return width/14 ; })
                .attr("height", function() { return height/6; })
                .attr("x", function() { return width * 0.92; })
                .attr("y", function() { return height * 0.03 + 5 + height/6; })
                .attr("fill", "rgb(0,255,255)")
                .on("click", function() { 
                     if(distortion.indexOf('x') === -1)
                        distortion += 'x';
                     else
                         distortion.replace('x', '');
                     updateDistortionX();    
                });
            
            calculateMapXY();
            scale();
            axis();
            appendAxis();
            draw();
            
            //TODO : ADD THE BUTTON TO SWAP THE CARTHESIAN DISTORTION
            
            function calculateMapXY() {
                var mergedMap = d3.merge(data.map(function (d) { return d.data; }));
                mapX = mergedMap.map(function(d) { return timeFormat.parse(d.x); });
                mapY = mergedMap.map(function(d) { return d.y; });
            }
            
            function scale() {
                //scales
                xScale = d3.time.scale.utc()
                    .domain(d3.extent(mapX))
                    .range([padding, width - padding]);
            
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - padding, padding]);
            
                //check for x, y distortion and update scale where necessary
                if(distortion.indexOf('x') !== -1 && distortion.indexOf('y') !== -1){
                    xScale = d3.fisheye.scale(d3.time.scale.utc)
                        .domain(d3.extent(mapX))
                        .range([padding + padding, width - padding]);
                    yScale = d3.fisheye.scale(d3.scale.linear)
                        .domain(d3.extent(mapY))
                        .range([height - padding - padding, padding]);
                }
                else if(distortion.indexOf('x') !== -1){
                    xScale = d3.fisheye.scale(d3.time.scale.utc)
                        .domain(d3.extent(mapX))
                        .range([padding + padding, width - padding]);
                    yScale = d3.scale.linear()
                        .domain(d3.extent(mapY))
                        .range([height - padding - padding, padding]);
                }
                else if(distortion.indexOf('y') !== -1) {
                    xScale = d3.time.scale.utc()
                        .domain(d3.extent(mapX))
                        .range([padding + padding, width - padding]);
                    yScale = d3.fisheye.scale(d3.scale.linear)
                        .domain(d3.extent(mapY))
                        .range([height - padding - padding, padding]);
                }
                
                //sliderscales
                xSliderScale = d3.scale.linear()
                    .domain(d3.extent(mapX))
                    .range([padding + padding , width - padding])
                    .clamp(true);
							 
                ySliderScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - padding - padding, padding])
                    .clamp(true);
            
                //line methods
                transline = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(){ return height - padding - padding; });
            
                line = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScale(d.y); });
            
                //brushes
                xBrush = d3.svg.brush()
                    .x(xSliderScale)
                    .on("brush", brushedX);
            
                yBrush = d3.svg.brush()
                    .y(ySliderScale)
                    .on("brush", brushedY);
            };

            function axis() {
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");
    					  
                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");
            
                xSliderAxis = d3.svg.axis()
                    .scale(xSliderScale)
                    .orient("bottom")
                    .ticks(0);
						  
                ySliderAxis = d3.svg.axis()
                    .scale(ySliderScale)
                    .orient("left")
                    .ticks(0);
            };
            
            function appendAxis() {

                svg.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (height - padding) + ")")
                    .call(xAxis);
		   
                svg.append("g")
                    .attr("class", "axis y")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(yAxis);
            };
            
            function updateAxis() {
                axis();
                var translate = "";
                //check for distortion, if yes move the x y axis to make room for the sliders
                if(distortion === "") translate = "translate(0, " + (height - padding) + ")";
                else translate = "translate(0, " + (height - padding - padding) + ")";
                // Update the Axis
                svg.selectAll('g.x.axis')
                    .transition().duration(1500)
                    .attr('transform', translate)
                    .call(xAxis);
            
                if(distortion === "") translate =  "translate(" + padding + ",0)";
                else translate = translate =  "translate(" + padding * 2 + ",0)";
                // Update the Axis
                svg.selectAll('g.y.axis')
                    .transition().duration(1500)
                    .attr('transform', translate)
                    .call(yAxis);
            }
            
            function sliderX() {             
                svg.append("g")
                    .attr("class", "slider x")
                    .attr("transform", "translate(0, " + (height - padding) + ")")
                    .call(xSliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");

                xSlider = svg.append("g")
                    .attr("class", "slider")
                    .call(xBrush);

                xHandle = xSlider.append("circle")
                    .attr("class", "handle")
                    .attr("transform", "translate(" + (padding + padding) + ", " + (height - padding) + ")")
                    .attr("r", 9);
            };
            
            function sliderY() {
                svg.append("g")
                    .attr("class", "slider y")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(ySliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");
            
                ySlider = svg.append("g")
                    .attr("class", "slider")
                    .call(yBrush);
            
                yHandle = ySlider.append("circle")
                    .attr("class", "handle")
                    .attr("transform", "translate(" + padding + "," + padding  + ")")
                    .attr("r", 9);
            }
            
            function draw() {
                //make the container for the lines and bind the data
                container = svg.selectAll('g.line')
                    .data(data);
            
                //update already existing lines
                container.selectAll('path')
                    .data(function(d) { return [d.data]; })
                    .transition().duration(1500)
                    .attr('d', line);
            
                //create the new lines
                container.enter().append('g')
                    .attr('stroke', function(d) { return d.color; })
                    .attr('class', 'line');
	
                container.selectAll('path')
                    .data(function(d) { return [d.data]; }) // continues the data from the container
                    .enter().append('path')
                    .attr('d', transline)
                    .transition().duration(1500)
                    .attr('d', line);
            
                //remove no longer existing lines
                container.exit().remove();
            };  
            
            //update the carthesian distortian according to the new x value
            function brushedX() {
                var valueSlider = xSliderScale.invert(lastX),
                    valueDistort = lastX;
                if (d3.event.sourceEvent) { // not a programmatic event
                    valueSlider = xSliderScale.invert(d3.mouse(this)[0]);
                    valueDistort = d3.mouse(this)[0];
                    lastX = valueDistort;
                }
                    xHandle.attr("cx", xSliderScale(valueSlider) - padding - padding);
                    xScale.distortion(3).focus(valueDistort);
                    container.selectAll('path')
                        .attr('d', line);
                    svg.selectAll('g.x.axis')
                     .call(xAxis);
            };   
            
            function brushedY() {
                var valueSlider = xSliderScale.invert(lastY),
                    valueDistort = lastY;
                if (d3.event.sourceEvent) { // not a programmatic event
                    valueSlider = xSliderScale.invert(d3.mouse(this)[1]);
                    valueDistort = d3.mouse(this)[1];
                    lastY = valueDistort;
                }
                yHandle.attr("cy", ySliderScale(valueSlider) - padding);
                yScale.distortion(3).focus(valueDistort);
                container.selectAll('path')
                    .attr('d', line);
                svg.selectAll('g.y.axis')
                    .call(yAxis);
            };
            
            function updateDistortionX() {
                //create the new scale
                scale();
                //create or delete the sliders if necessary
                if(distortion.indexOf('x') !== -1) sliderX();
                else {
                   svg.selectAll("g.slider").remove();
                   svg.selectAll("g.handle").remove();
                   svg.selectAll("g.halo").remove();
                }
                //update the axis to the new scale
                updateAxis();
                draw();
            }

        });
        
    }
    
    //because binding the data by index will not work, we bind the data by name. this funcion is called for the keys (names)
    function name(d){
        return d.name;
    }
    
    chart.data = function(value) {
    	if (!arguments.length) return data;
    	data = value;
    	if (typeof updateData === 'function') updateData();
    	return chart;
    };
        
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
    };
 
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        if (typeof updateHeight === 'function') updateHeight();
        return chart;
    };
    
    return chart;
}