function complexLineGraph(){
    //variables
    var margin = 10;
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
            //the brush for choosing the focus on the context
            var brushContext;
            //timeformat var
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');
            
            //initiliaze the chart so all the variables used by updateData are initialized.
            function initialize(){
                //make the svg and append it to the element
                svg = d3.select(element)
                    .append('svg')
                    .attr('width', width + padding.left + padding.right)
                    .attr('height',(height + padding.top + padding.bottom))
                    .attr('class', 'svgbox');
            
                focus = svg.append('g')
                    .attr('class', 'focus');
            
                focusClipBox = focus.append('defs').append('clipPath')
                        .attr('id', 'clip')
                        .append('rect')
                            .attr('width', width)
                            .attr('x', margin + padding.left)
                            .attr('height', heightFocus)
                            .attr('y', padding.top)
                            .style('fill', 'red')
                            .style('opacity', '0.5');                 
            
                context = svg.append('g')
                    .attr('class', 'context');
            
                //do these functions to initialize the vars needed for updates
                initBrushContext();
                mapData();
                scalesFocus();
                scalesContext();
                initAxes();
                
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
                    .range([margin + padding.left , margin + padding.left + width]);
            
                data.forEach(function(datum){
                    var scale = d3.scale.linear()
                        .domain(d3.extent(mapY[datum.name]))
                        .range([heightFocus - margin, padding.top + margin]);
                    yScaleFocus[datum.name] = scale;
                });
                
                data.forEach(function(datum){
                    var line = d3.svg.line().interpolate("monotone")
                    .x(function(d){ return xScaleFocus(timeFormat.parse(d.x)); })
                    .y(function(d, i){ return yScaleFocus[datum.name](d.y); });  
                    lineFocus[datum.name] = line;
                });   
            }
            
            function scalesContext(){
                xScaleContext = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([margin + padding.left , margin + padding.left + width]);
            
                data.forEach(function(datum){
                    var scale = d3.scale.linear()
                        .domain(d3.extent(mapY[datum.name]))
                        .range([padding.top + height - margin, heightFocus + padding.top + margin]);
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
    		
                /*data.forEach(function(index){
                    var axis = d3.svg.axis()
                        .scale(yScaleFocus[index])
                        .orient("left");
                    yAxisFocus[index] = axis;
                }); */                   
            
                xAxisContext = d3.svg.axis()
                    .scale(xScaleContext)
                    .orient("bottom");
            
                focus.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (heightFocus - margin) + ")")
                    .call(xAxisFocus);
		   
               /* data.forEach(function(index){
                    var translate;
                    if(index === 0) translate = "translate(" + (padding.left + margin) + ",0)";
                    else translate = "translate(" + (padding.left + margin + width + (margin * index)) + ",0)";
                     focus.append("g")
                        .attr("class", "axis y")
                        .attr("transform", translate)
                        .call(yAxisFocus[index]);
                });*/
            
                context.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + (padding.top + height - margin) + ")")
                    .call(xAxisContext);
            }
            
            function updateAxesFocus(){
                xAxisFocus = d3.svg.axis()
                    .scale(xScaleFocus)
                    .orient("bottom");
    					  
                /*data.forEach(function(datum, index){
                    var axis = d3.svg.axis()
                        .scale(yScaleFocus[index])
                        .orient("left");
                    yAxisFocus[index] = axis;
                });     */          
                
                // Update the Axis
                focus.selectAll('g.x.axis')
                    .attr("transform", "translate(0, " + (heightFocus - margin) + ")")
                    .call(xAxisFocus);
            
                //focus.selectAll('g.y.axis').remove();
            
                /* data.forEach(function(datum, index){
                    var translate;
                    if(index === 0) translate = "translate(" + (padding.left + margin) + ",0)";
                    else translate = "translate(" + (padding.left + margin + width + (margin * index)) + ",0)";
                     focus.append("g")
                        .attr("class", "axis y")
                        .attr("transform", translate)
                        .call(yAxisFocus[index]);
                });*/
            }
            
            function updateAxesContext(){
                xAxisContext = d3.svg.axis()
                    .scale(xScaleContext)
                    .orient("bottom");
            
                // Update the Axis
                context.selectAll('g.x.axis')
                    .attr("transform", "translate(0, " + (padding.top + height - margin) + ")")
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
                    .attr("y", heightFocus + margin + margin)
                    .attr("height", heightContext - margin);
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