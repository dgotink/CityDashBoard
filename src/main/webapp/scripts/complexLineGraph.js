function complexLineGraph(){
    //variables
    var margin = {'border': 10, 'between': 50};
    var padding = {'top': 20, 'right': 100, 'bottom': 20, 'left': 40};
    var width = 800;
    var heightFocus = 350;
    var heightContext = 50;
    var height = heightFocus + heightContext;
    var data = [];
    var updateData;
    
    function chart(selection){
        selection.each(function() { 
            //data vars
            var mergedMap;
            var mapX;
            var mapY = [];
            //scale vars
            var xScaleFocus;
            var yScaleFocus = {};
            var xScaleContext;
            var yScaleContext = {};
            //line function vars
            var lineFocus = {};
            var lineContext = {};
            //axis vars
            var xAxisFocus;
            //var yAxisFocus = [];
            var xAxisContext;
            //svg vars and containers
            var svg;
            var element = this;
            var focus;
            var focusClipBox;
            var context;
            //brush var for choosing the focus on the context
            var brushContext;
            //rect var to draw a rect (looks like a line) where the mousepointer is
            var rectMousePointer;
            //timeformat var
            var timeFormat = d3.time.format.utc('%Y-%m-%dT%H:%M:%S.%LZ');
            //bisectdate var to determine closest datapoint to the mousepointer
            var bisectDate = d3.bisector(function(d) { return timeFormat.parse(d.x); }).left;
            
            //initiliaze the chart so all the variables used by updateData are initialized.
            function initialize(){
                //make the svg and append it to the element
                svg = d3.select(element)
                    .append('svg')
                    .attr('width', width + padding.left + padding.right + margin.border + margin.border)
                    .attr('height',height + padding.top + padding.bottom + + margin.border + margin.border + margin.between)
                    .attr('class', 'svgbox');
            
                focus = svg.append('g')
                    .attr('class', 'focus');
            
                focusClipBox = focus.append('defs').append('clipPath')
                        .attr('id', 'clip')
                        .append('rect')
                            .attr('width', width)
                            .attr('x', margin.border + padding.left)
                            .attr('height', heightFocus + margin.border)
                            .attr('y', padding.top);
                    
                //create the rect for the mousepointer and append it to the focus    
                rectMousePointer = focus.append('rect')
                        .attr('x', width)
                        .attr('y', padding.top + margin.border)
                        .attr('width', 1)
                        .attr('height', heightFocus)
                        .style('shape-rendering', 'crispEdges')
                        .style('fill', 'lightgray')
                        .style('visibility', 'hidden');
                
                focus.append('rect')
                        .attr('width', width)
                        .attr('x', margin.border + padding.left)
                        .attr('height', heightFocus + margin.border)
                        .attr('y', padding.top)
                        .style('opacity', '0')
                        .on('mouseenter', mouseEnterFocus)
                        .on('mouseleave',mouseLeaveFocus)
                        .on('mousemove', mouseOverFocus);
            
                context = svg.append('g')
                    .attr('class', 'context');
            
                //do these functions to initialize the vars needed for updates
                initBrushContext();
                mapData();
                scalesFocus();
                scalesContext();
                initAxes();
                
            }
            
            function mouseEnterFocus(){
                rectMousePointer   
                        .style('visibility', 'visible');
            }
            
            function mouseLeaveFocus(){
                focus.selectAll('.dataText').remove();
                focus.selectAll('.dataRect').remove();
                focus.selectAll('.dataCircle').remove();
                rectMousePointer   
                        .style('visibility', 'hidden');
            }
            
            function mouseOverFocus(){
                //remove previous texts
                focus.selectAll('.dataText').remove();
                focus.selectAll('.dataRect').remove();
                focus.selectAll('.dataCircle').remove();
                //get the x coordinate of the mouse
                var mouseX =  d3.mouse(this)[0]; 
                //move the rect to the new mouse position
                rectMousePointer
                        .attr('x', mouseX);
                //determine the date from the mouse position
                var dateX = xScaleFocus.invert(mouseX);
                //for each dataset in data, find the closest point to dateX and print the Y value on the screen
                //count the amount of dataset texts written to set the Y values under each other
                var count = 0;
                var fontsize = 12;
                var textmargin = 5;
                data.forEach(function(dataset){
                    var i = bisectDate(dataset.data, dateX);
                    var datum = closestDataPointToValueX(dataset.data[i-1], dataset.data[i], dateX);
                    
                    var text = focus.append('text')
                        .attr('class', 'dataText')
                        .attr('x', mouseX + margin.border)
                        .attr('y', padding.top + heightFocus - (count * (textmargin + fontsize)))
                        .text( function () { return datum.y ; })
                        .style('font-family', 'sans-serif')
                        .style('font-size', fontsize)
                        .style('fill', dataset.color);
                
                    var bbox = text.node().getBBox();
                
                    focus.append('rect')
                        .attr('class', 'dataRect')
                        .attr('x', bbox.x - margin.border/2)
                        .attr('y', bbox.y)
                        .attr('width', bbox.width + margin.border)
                        .attr('height', bbox.height)
                        .style("fill", "lightgray")
                        .style('opacity', '0.9');
                
                    focus.append('text')
                        .attr('class', 'dataText')
                        .attr('x', mouseX + margin.border)
                        .attr('y', padding.top + heightFocus - (count * (textmargin + fontsize)))
                        .text( function () { return datum.y ; })
                        .style('font-family', 'sans-serif')
                        .style('font-size', fontsize)
                        .style('fill', dataset.color);
                
                    focus.append('circle')
                        .attr('class', 'dataCircle')
                        .attr('cx', xScaleFocus(timeFormat.parse(datum.x)))
                        .attr('cy', yScaleFocus[dataset.name](datum.y))
                        .attr('r', 3)
                        .style('fill', dataset.color);
                
                    count++;
                });
            }
            
            function closestDataPointToValueX(object1, object2, value){
                var xObject1 = timeFormat.parse(object1.x);
                var xObject2 = timeFormat.parse(object2.x);
                var inBetweenObjects = (xObject2 - xObject1)/2;
                if(value < new Date(xObject1.getTime() + inBetweenObjects)) return object1;
                else return object2;
            }
            
            function mapData(){
                mergedMap = d3.merge(data.map(function (d) { return d.data; }));
                mapX = mergedMap.map(function(d) { return timeFormat.parse(d.x); });
                mapY = [];
                data.forEach(function(datum){
                    var map = datum.data.map(function(d) { return d.y; });
                    mapY[datum.name] = map;
                });
            }
            
            function scalesFocus(){
                xScaleFocus = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([margin.border + padding.left , margin.border + padding.left + width]);
            
                data.forEach(function(datum){
                    var scale = d3.scale.linear()
                        .domain(d3.extent(mapY[datum.name]))
                        .range([padding.top + margin.border + heightFocus, padding.top + margin.border]);
                    yScaleFocus[datum.name] = scale;
                });
                
                data.forEach(function(datum){
                    var line = d3.svg.line().interpolate("monotone")
                    .x(function(d){ return xScaleFocus(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScaleFocus[datum.name](d.y); });  
                    lineFocus[datum.name] = line;
                });   
            }
            
            function scalesContext(){
                xScaleContext = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([margin.border + padding.left , margin.border + padding.left + width]);
            
                data.forEach(function(datum){
                    var scale = d3.scale.linear()
                        .domain(d3.extent(mapY[datum.name]))
                        .range([padding.top + height + margin.between - margin.border, heightFocus + padding.top + margin.border + margin.between]);
                    yScaleContext[datum.name] = scale;
                });
                
                data.forEach(function(datum){
                    var line = d3.svg.line().interpolate("monotone")
                    .x(function(d){ return xScaleContext(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScaleContext[datum.name](d.y); });  
                    lineContext[datum.name] = line;
                });   
                
                //brush
                brushContext.x(xScaleContext);
            }
            
            function initAxes(){
                xAxisFocus = d3.svg.axis()
                    .scale(xScaleFocus)
                    .orient("bottom");
    		
                xAxisContext = d3.svg.axis()
                    .scale(xScaleContext)
                    .orient("bottom");
            
                focus.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (padding.top + margin.border + heightFocus) + ")")
                    .call(xAxisFocus);
            
                context.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (padding.top + height + margin.between - margin.border) + ")")
                    .call(xAxisContext);
            }
            
            function updateAxesFocus(){
                xAxisFocus = d3.svg.axis()
                    .scale(xScaleFocus)
                    .orient("bottom");          
                
                // Update the Axis
                focus.selectAll('g.x.axis')
                    .attr("transform", "translate(0, " + (padding.top + margin.border + heightFocus) + ")")
                    .call(xAxisFocus);
            }
            
            function updateAxesContext(){
                xAxisContext = d3.svg.axis()
                    .scale(xScaleContext)
                    .orient("bottom");
            
                // Update the Axis
                context.selectAll('g.x.axis')
                    .attr("transform", "translate(0, " + (padding.top + height + margin.between - margin.border) + ")")
                    .call(xAxisContext);
            }
            
            function initBrushContext() {
                //brush
                brushContext = d3.svg.brush()
                    .on("brush", brushedContext);  
            
                context.append("g")
                    .attr("class", "x brush")
                    .call(brushContext)
                    .selectAll("rect")
                    .attr("y", heightFocus + padding.top + margin.between)
                    .attr("height", heightContext - margin.border);
            }
            
            //update the existing brushcontext according to the new brush
            function updateBrushContext() {
                context.select("g.x.brush")
                    .call(brushContext);
            }
            
            function drawFocus(){
                //remove all lines
                focus.selectAll('g.line').remove();
                //draw all the lines
                data.forEach(function(datum){
                    var line = lineFocus[datum.name];
                    focus.append('g')
                        .attr('class', 'line')
                        .append('path')
                            .style('stroke', datum.color)
                            .attr('clip-path', 'url(#clip)')
                            .attr('d', line(datum.data));      
                });
            }
            
            function drawContext(){
                //remove all lines
                context.selectAll('g.line').remove();
                //draw all the lines
                data.forEach(function(datum){
                    var line = lineContext[datum.name];
                    context.append('g')
                        .attr('class', 'line')
                        .append('path')
                            .style('stroke', datum.color)
                            .attr('d', line(datum.data));      
                });
            }
            
            function brushedContext() {
                if(brushContext.empty())
                    xScaleFocus.domain(xScaleContext.domain());
                else {
                    xScaleFocus.domain(brushContext.extent());
                }
                updateAxesFocus();
                drawFocus();
            }
            
            updateData = function(){
                mapData();
                scalesFocus();
                scalesContext();
                updateBrushContext();
                brushedContext();
                updateAxesContext();
                drawContext();
            };
            
            initialize();
            
        });
    };
    
    chart.data = function(value) {
    	if (!arguments.length) return data;
    	data = value;
    	if (typeof updateData === 'function') updateData();
    	return chart;
    };
    
    return chart;
}