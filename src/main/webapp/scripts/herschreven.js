function herschreven() { 
    
    //variablen
    var width = 800,
        height = 350,
        padding = 25,
        contextHeight = 40,
        margin = 10,
        focusHeight = height - padding - contextHeight - margin;
        

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
                yScale,
                xContextScale,
                yContextScale;
            //the scales needed to make the sliders for carthesian distortion  
            var xSliderScale,
                ySliderScale;
            //the axes to be displayed    
            var xAxis,
                yAxis,
                xContextAxis;
            //the axes for the sliders to be displayed on
            var xSliderAxis,
                ySliderAxis;
            //the brushes for the carthesian distortion 
             var xBrush,
                 yBrush;
            //the brush to change the focus
            var contextBrush;
            //the sliders for the carthesian distortion
            var xSlider,
                ySlider;
            //the slider handles (which the user can move)
            var xHandle,
                yHandle;
            //the last known x, y slider value
            var lastX = padding + padding, //this value puts the lastX on the left of the xSliderAxis
                lastY = focusHeight - padding - padding; //this value puts the lastY on the bottom of the ySliderAxis
            //the containers which holds all the lines
            var focusContainer,
                contextContainer;
            //the element to which the svg is assigned
            var element = this;
            
            //time parser
            var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
            
            //line methods
            var translineFocus,
                lineFocus,
                translineContext,
                lineContext;
                
            //create the SVG
            var svg = d3.select(element)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "svgbox");

            var focus = svg.append('g')
                .attr("class", "focus");
        
            //append a clippath so lines can't exceed the focus box
            var clip = focus.append("defs").append("clipPath")
                .attr("id", "clip")
            var clipBox = clip.append("rect")
                    .attr("width", width - padding - padding)
                    .attr("x", padding)
                    .attr("height", height - padding - padding)
                    .attr("y", padding);
        
            var context = svg.append('g')
                .attr("class", "context");   

            calculateMapXY();
            initScale();
            axis();
            appendAxis();
            draw();
            addButtons();
            drawContext();
            appendBrushContext();
            
            //adds buttons for switching distortion, melding
            function addButtons(){
                //vars that determine the size of the buttons
                var edge = 20;
                var margin = 10;
                //if the id of the container is primitive, it can be added to the arr of the data of the collectedlinegraphbox
                //this will add a rect with a onclick event that swaps (add/remove) the data from the Data arr (data.js)
                if(element.id === "PrimitiveLineGraphBox"){
                    svg.append("rect")
                        .data(data)
                        .attr("width", function() { return edge ; })
                        .attr("height", function() { return edge; })
                        .attr("x", function() { return width - margin - edge; })
                        .attr("y", function() { return margin; })
                        .attr("fill", "rgb(0,0,0)")
                        .on('click', function(d) { swap(d); });	
                }
            
                //add a button to turn the distortion on or off for x
                svg.append("rect")
                    .attr("width", function() { return edge ; })
                    .attr("height", function() { return edge; })
                    .attr("x", function() {  return width - margin - edge; })
                    .attr("y", function() { return margin + edge + margin/2; })
                    .attr("fill", "rgb(0,255,255)")
                    .on("click", function() { 
                        if(distortion.indexOf('x') === -1)
                            distortion += 'x';
                        else
                            distortion = distortion.replace(/x/g, '');
                        updateDistortionX();    
                }); 
                
                //add a button to turn the distortion on or off for y
                svg.append("rect")
                    .attr("width", function() { return edge ; })
                    .attr("height", function() { return edge; })
                    .attr("x", function() {  return width - margin/2 - edge - margin - edge; })
                    .attr("y", function() { return margin; })
                    .attr("fill", "rgb(255,0,255)")
                    .on("click", function() { 
                        if(distortion.indexOf('y') === -1)
                            distortion += 'y';
                        else
                            distortion = distortion.replace(/y/g, '');
                        updateDistortionY();    
                }); 
            }
            
            //calculates the mapX and the mapY from the data
            function calculateMapXY() {
                var mergedMap = d3.merge(data.map(function (d) { return d.data; }));
                mapX = mergedMap.map(function(d) { return timeFormat.parse(d.x); });
                mapY = mergedMap.map(function(d) { return d.y; });
            }
            
            function initScale(){
                scaleNoDistortion();
            
                xContextScale = d3.time.scale.utc()
                    .domain(d3.extent(mapX))
                    .range([padding, width - padding]);
                
                yContextScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - padding, padding + focusHeight + margin]);
            
                //sliderscales
                xSliderScale = d3.scale.linear()
                    .domain(d3.extent(mapX))
                    .range([padding + padding , width - padding])
                    .clamp(true);
							 
                ySliderScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([focusHeight - padding - padding, padding])
                    .clamp(true);
            
                //line methods
                translineFocus = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(){ return focusHeight - padding; });
            
                lineFocus = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScale(d.y); });
            
                translineContext = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xContextScale(timeFormat.parse(d.x)); })
                    .y(function(){ return height - padding; });
            
                lineContext = d3.svg.line().interpolate("basis")
                    .x(function(d){ return xContextScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yContextScale(d.y); });
            
                //brushes
                xBrush = d3.svg.brush()
                    .x(xSliderScale)
                    .on("brush", brushedX);
            
                yBrush = d3.svg.brush()
                    .y(ySliderScale)
                    .on("brush", brushedY);
                
                contextBrush = d3.svg.brush()
                    .x(xContextScale)
                    .on("brush", brushedContext);        
            }
            
            function scaleNoDistortion(){
                xScale = d3.time.scale.utc()
                    .domain(d3.extent(mapX))
                    .range([padding, width - padding]);
            
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([focusHeight - padding, padding]);
               //no distortion means the clipbox is a bit bigger because the axis isn't moved to make room for the slider
               clipBox
                    .attr("width", width  - padding - padding)
                    .attr("x",  padding);

            }
            
            function scaleDistortionX() {
                xScale = d3.fisheye.scale(d3.time.scale.utc)
                    .domain(d3.extent(mapX))
                    .range([padding + padding, width - padding]);
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([focusHeight - padding - padding, padding]);
            }
            
            function scaleDistortionY() {
                xScale = d3.time.scale.utc()
                    .domain(d3.extent(mapX)) 
                    .range([padding + padding, width - padding]);
                yScale = d3.fisheye.scale(d3.scale.linear)
                    .domain(d3.extent(mapY))
                    .range([focusHeight - padding - padding, padding]);
            }
            
            function scaleDistortionXY() {
                xScale = d3.fisheye.scale(d3.time.scale.utc)
                    .domain(d3.extent(mapX))
                    .range([padding + padding, width - padding]);
                yScale = d3.fisheye.scale(d3.scale.linear)
                    .domain(d3.extent(mapY))
                    .range([focusHeight - padding - padding, padding]);
            }
            
            function updateScaleData() {
                 xScale.domain(d3.extent(mapX));
                 yScale.domain(d3.extent(mapY));
                 xContextScale.domain(d3.extent(mapX));
                 yContextScale.domain(d3.extent(mapY));
                 xSliderScale.domain(d3.extent(mapX));
                 ySliderScale.domain(d3.extent(mapY));
            }
            
            //calculates the scale and the things that are only dependent on the scale (line & brush)
            function distortionScale() {
                //move the clipbox because the axes move to make room for the sliders
                clipBox
                    .attr("width", width - padding - padding - padding)
                    .attr("x", padding + padding);
                //check for x, y distortion and update scale where necessary
                //distortion = xy
                if(distortion.indexOf('x') !== -1 && distortion.indexOf('y') !== -1)
                   scaleDistortionXY();
                //distortion = x
                else if(distortion.indexOf('x') !== -1)
                    scaleDistortionX();
                //distortion = y
                else if(distortion.indexOf('y') !== -1) 
                    scaleDistortionY();
                //no distortion
                else
                    scaleNoDistortion(); 
            };

            //defines the axes
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
            
                xContextAxis = d3.svg.axis()
                    .scale(xContextScale)
                    .orient("bottom");
            };
            
            //add the standard axes to the svg element
            function appendAxis() {
                focus.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (focusHeight - padding) + ")")
                    .call(xAxis);
		   
                focus.append("g")
                    .attr("class", "axis y")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(yAxis);
            
                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (height - padding) + ")")
                    .call(xContextAxis);
            };
            
            //redraw the axes
            function updateAxis() {
                var translate = "";
                //check for distortion, if yes move the x y axis to make room for the sliders
                //x
                if(distortion === "") translate = "translate(0, " + (focusHeight - padding) + ")";
                else translate = "translate(0, " + (focusHeight - padding - padding) + ")";
                // Update the Axis
                focus.selectAll('g.x.axis')
                    //.transition().duration(1500)
                    .attr('transform', translate)
                    .call(xAxis);
                //y
                if(distortion === "") translate =  "translate(" + padding + ",0)";
                else translate = translate =  "translate(" + padding * 2 + ",0)";
                // Update the Axis
                focus.selectAll('g.y.axis')
                    //.transition().duration(1500)
                    .attr('transform', translate)
                    .call(yAxis);
                //contextaxis
                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (height - padding) + ")")
                    .call(xContextScale);
            }
            
            //append the x slider to the svg element
            function sliderX() {             
                focus.append("g")
                    .attr("class", "slider x")
                    .attr("transform", "translate(0, " + (focusHeight - padding) + ")")
                    .call(xSliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");

                xSlider = focus.append("g")
                    .attr("class", "slider x")
                    .call(xBrush);

                xHandle = xSlider.append("circle")
                    .attr("class", "handle x")
                    .attr("transform", "translate(" + (padding + padding) + ", " + (focusHeight - padding) + ")")
                    .attr("r", 9);
            };
            
            //append the y slider to the svg element
            function sliderY() {
                focus.append("g")
                    .attr("class", "slider y")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(ySliderAxis)
                    .select(".domain")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                    .attr("class", "halo");
            
                ySlider = focus.append("g")
                    .attr("class", "slider y")
                    .call(yBrush);
            
                yHandle = ySlider.append("circle")
                    .attr("class", "handle y")
                    .attr("transform", "translate(" + padding + "," + padding  + ")")
                    .attr("r", 9);
            }
            
            function appendBrushContext() {
                context.append("g")
                    .attr("class", "x brush")
                    .call(contextBrush)
                    .selectAll("rect")
                    .attr("y", height - contextHeight - padding)
                    .attr("height", contextHeight);
            }
            
            //update the existing brushcontext according to the new brush
            function updateBrushContext() {
                context.select("g.x.brush")
                    .call(contextBrush);
            }
            
            //draw the lines (update, enter, exit) 
            //DO THIS WHEN THE DATA IS CHANGED
            function draw() {
                //make the container for the lines and bind the data
                focusContainer = focus.selectAll('g.line')
                    .data(data, name);
            
                //update already existing lines
                focusContainer.selectAll('path')
                    .data(function(d) { return [d.data]; })
                    //.transition().duration(1500)
                    .attr('d', lineFocus);
            
                //create the new lines
                focusContainer.enter().append('g')
                    .attr('stroke', function(d) { return d.color; })
                    .attr('clip-path', 'url(#clip)')
                    .attr('class', 'line');
	
                focusContainer.selectAll('path')
                    .data(function(d) { return [d.data]; }) // continues the data from the container
                    .enter().append('path')
                    .attr('d', translineFocus)
                    //.transition().duration(1500)
                    .attr('d', lineFocus);
            
                //remove no longer existing lines
                focusContainer.exit().remove();
            };  
            
            //draw the lines again
            //DO THIS WHEN THE SCALE HAS CHANGED BUT THE DATASET IS THE SAME
            function redraw() {
                //redraw the line
                focusContainer.selectAll('path')
                    .attr('d', lineFocus);
            }
            
            //create the context elements and append them to the context
            function drawContext() {
                contextContainer = context.selectAll('g.line')
                    .data(data);
            
                //update already existing lines
                contextContainer.selectAll('path')
                    .data(function(d) { return [d.data]; })
                    //.transition().duration(1500)
                    .attr('d', lineContext);
            
                //create the new lines
                contextContainer.enter().append('g')
                    .attr('stroke', function(d) { return d.color; })
                    .attr('class', 'line');
	
                contextContainer.selectAll('path')
                    .data(function(d) { return [d.data]; }) // continues the data from the container
                    .enter().append('path')
                    .attr('d', translineContext)
                    //.transition().duration(1500)
                    .attr('d', lineContext);
            
                //remove no longer existing lines
                contextContainer.exit().remove();
            }
            
            //redraw the slider, the axes, the line according to the new distortion value
            function brushedX() {
                //if the event is called by the program (not manually)
                //set the lastX for the mouse position and draw the new line without animation
                if (d3.event.sourceEvent) { 
                    lastX = d3.mouse(this)[0];
                    xScale.distortion(3).focus(lastX);
                    focusContainer.selectAll('path')
                        .attr('d', lineFocus);
                } else {
                    //draw with animation
                    xScale.distortion(3).focus(lastX);
                    focusContainer.selectAll('path')
                        //.transition().duration(1500)
                        .attr('d', lineFocus);
                }
                // do always
                xHandle.attr("cx", lastX - padding - padding);
                focus.selectAll('g.x.axis')
                    .call(xAxis);
            };   
            
            //redraw the slider, the axes, the line according to the new distortion value
            function brushedY() {
                //if the event is called by the program (not manually)
                //set the vars for the mouse position and draw the new line without animation
                if (d3.event.sourceEvent) { 
                    lastY = d3.mouse(this)[1];
                    yScale.distortion(3).focus(lastY);
                    focusContainer.selectAll('path')
                        .attr('d', lineFocus);
                 } else {
                    //draw with animation
                    yScale.distortion(3).focus(lastY);
                    focusContainer.selectAll('path')
                        //.transition().duration(1500)
                        .attr('d', lineFocus);
                }
                // do always
                yHandle.attr("cy", lastY - padding);
                focus.selectAll('g.y.axis')
                    .call(yAxis);
            };
            
            function brushedContext() {
                if(contextBrush.empty())
                    xScale.domain(xContextScale.domain());
                else
                    xScale.domain(contextBrush.extent());
                updateAxis();
                redraw();
            }
            
            //update the carthesian distortian according to the new x value
            function updateDistortionX() {
                //create the new scale
                distortionScale();
                //create or delete the sliders if necessary
                if(distortion.indexOf('x') !== -1) {
                    sliderX();
                    brushedX();                   
                }
                else {
                   focus.selectAll("g.x.slider").remove();
                   focus.selectAll("g.x.handle").remove();
                   focus.selectAll("g.x.halo").remove();
                }
                if(distortion.indexOf('y') !== -1) {
                    brushedY();
                }
                
                //update the axis to the new scale & redraw
                axis();
                updateAxis();
                updateBrushContext();
                brushedContext();
            }
            
            //update the carthesian distortian according to the new y value
            function updateDistortionY() {
                //create the new scale
                distortionScale();
                //create or delete the sliders if necessary
                if(distortion.indexOf('y') !== -1) {
                    sliderY();
                    brushedY(); 
                }
                else {
                   focus.selectAll("g.y.slider").remove();
                   focus.selectAll("g.y.handle").remove();
                   focus.selectAll("g.y.halo").remove();
                }
                if(distortion.indexOf('x') !== -1) {
                    brushedX();
                }
                
                //update the axis to the new scale & redraw
                axis();
                updateAxis();
                updateBrushContext();
                brushedContext();
            }
            
            //this function is called whenever the dataset changes
            updateData = function (){
                calculateMapXY();
                updateScaleData();
                axis();
                updateAxis();
                draw();
                drawContext();
                updateBrushContext();
                brushedContext();
            };

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
    
    return chart;
}