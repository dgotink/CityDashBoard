function linegraph(){
    //variables
    var width;
    var height;
    var padding = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0};
    
    var data = {};  
    
    var element;
   
    //parent callback functions
    var onChildClick;   
    var onChildEnter;
    var onChildLeave;
    var onChildMove;   
    var onSizeChangedCallback;
    
    //child callback functions
    var updateData;
    var updateWidth;
    var updateHeight;
    var showDataInformation;
    var updateDomain;
    
    var _MIN_HEIGHT_NEEDED_FOR_AXIS = 50;
    
    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //data vars
            var mapX;
            var mapY;
            //scale vars & domain for x
            var xScale;
            var xDomain = null;
            var yScale;
            //axis var
            var yAxis;
            //line function var
            var line_animation;
            var line;
            //svg var
            var svg;
            var lineRect;
            element = this;
            //clip var
            var clipRect;
            //label var
            var label;
            //a rect that shows the current X value on the graph (looks like a vertical line)
            var mouse_indicator;
            //data information var group
            var data_information = null;
            //timeformat var
            var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
            //bisect var
            var bisect = d3.bisector(function(d) { return timeFormat.parse(d.x); }).left;

            //makes and appends the svg to the element and adds buttons 
            function svg(){
                //make the svg
                svg = d3.select(element)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "svgbox")
                    .on('click', onMouseClick);   
            
                var clip = svg.append('clipPath')
                        .attr('id', 'lineClip_' + data.name);
                
                clipRect = clip.append('rect')
                    .style('opacity', '0')
                    .attr('x', padding.left)
                    .attr('y', 0)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height);
                
                lineRect = svg.append('rect')
                    .style('opacity', '0')
                    .attr('x', padding.left)
                    .attr('y', padding.top)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height - padding.top - padding.bottom) 
                    .on('mouseenter', onMouseEnter)
                    .on('mouseleave', onMouseLeave)
                    .on('mousemove', onMouseMove);
            }
            
            //initiliaze the mouse_indicator rectangle
            function indicator(){
                mouse_indicator = svg.append('rect')
                    .attr("pointer-events", "none")
                    .attr('x', width/2)
                    .attr('y', 0)
                    .attr('width', 1)
                    .attr('height', height)
                    .attr('class', 'mouse_indicator')
                    .style('shape-rendering', 'crispEdges')
                    .style('fill', 'lightgray')
                    .style('visibility', 'hidden');
            }
            
            function updateIndicator(){
                mouse_indicator
                    .attr('height', height);
            }
            
            function label(){
                label = svg.append('text')
                    .attr('class', 'label')
                    .style('font-family', 'Helvetica, Arial, sans-serif')
                    .style('font-size','12px')
                    .style('fill', data.color)
                    .text(data.name);
                updateLabel();
            }
            
            function updateLabel() {
                var margin = 10;
                var value = data.data[(data.data.length-1)];
                label
                    .transition().duration(800)
                    .attr('x', xScale(timeFormat.parse(value.x)) + margin)
                    .attr('y', yScale(value.y));
            }
            
            function updateSvg() {
                svg
                    //.transition().duration(1000)
                    .attr("width", width)
                    .attr("height", height);
            
                clipRect 
                    .attr('x', padding.left)
                    .attr('y', 0)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height);
            
                lineRect
                    .attr('x', padding.left)
                    .attr('y', padding.top)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height - padding.top - padding.bottom);
            }
            
            function onMouseClick() {
                onChildClick(data.name);
            }
            
            function onMouseEnter() {
                onChildEnter();
            };
            
            function onMouseLeave() {
                onChildLeave();
            };  
            
            function onMouseMove() {
                var mouse = d3.mouse(this);
                onChildMove(mouse[0]);
            };  

            function mapData() {
                mapX = data.data.map(function(d) { return timeFormat.parse(d.x); });
                mapY = data.data.map(function(d) { return d.y; });
            }
                        
            function scales() {
                xScale = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([padding.left, width - padding.right]);
            
                if(null === xDomain) 
                    xDomain = xScale.domain();
                else
                    xScale.domain(xDomain);
            
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - padding.bottom, padding.top]);
            
                line_animation = d3.svg.line().interpolate("linear")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return height - padding.bottom; });  
            
                line = d3.svg.line().interpolate("linear")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScale(d.y); });  
            }
            
            function axes() {                
                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .tickSize(0)
                    .tickValues(yScale.domain());
            
                    svg.append('g')
                    .attr('class', 'axis')
                    .attr('transform', 'translate(' + padding.left + ', 0)')
                    .call(yAxis); 
            }
            
            function updateAxes() {
                if(height >= _MIN_HEIGHT_NEEDED_FOR_AXIS){  
                    svg.select('g.axis').style('opacity', '1'); 
                    yAxis.scale(yScale);
                    var t = svg.transition().duration(800);
                    t.select('g.axis').call(yAxis);
                } else {
                    svg.select('g.axis').style('opacity', '0');
                }             
            }
            
            function redraw() {
                var container = svg.selectAll('g.line')
                    .data([data]);
            
                //update
                container.selectAll('path')
                    .data(function(d) { return [d.data]; })
                    .attr('clip-path', 'url(#lineClip_' + data.name + ')')
                    //.transition().duration(800)
                    .attr('d', line);
            
                //enter
                container.enter().append('g')
                    .style('stroke', function(d) { return d.color; })
                    .attr("pointer-events", "none")
                    .attr('class', function(d) { return 'line ' + d.name; });
            
                container.selectAll('path')
                    .data(function(d) { return [d.data]; }) 
                    .enter().append('path')
                    .attr('clip-path', 'url(#lineClip_' + data.name + ')')
                    .attr('d', line_animation)
                    //.transition().duration(1000)
                    .attr('d', line);
            }
            
            updateData = function() {
                mapData();
                scales();
                redraw(); 
            };
            
            updateWidth = function() {
                updateSvg();
                mapData();
                scales();
                redraw(); 
            };
            
            updateHeight = function() {
                updateSvg();           
                onSizeChangedCallback();
                mapData();
                scales();
                updateAxes();
                redraw(); 
                updateIndicator();
                updateLabel();
            };
            
            showDataInformation = function(position) {
                if( height >= _MIN_HEIGHT_NEEDED_FOR_AXIS ){
                    
                    var date =  xScale.invert(position);
                    var index = bisect(data.data, date);
                    var dataset = closestDataPointToValueX(data.data[index-1], data.data[index], date);
                    
                    if(null === data_information){
                        data_information = svg.append('g')
                            .attr("pointer-events", "none")
                            .attr('class', 'data_information');
                    
                        data_information.append('text')
                            .attr('class', 'datatext')
                            .attr('x', xScale(timeFormat.parse(dataset.x)))
                            .attr('y', yScale(dataset.y) - 5)
                            .text(dataset.y);
                
                        data_information.append('circle')
                            .attr('class', 'datacircle')
                            .attr('cx', xScale(timeFormat.parse(dataset.x)))
                            .attr('cy', yScale(dataset.y))
                            .attr('r', 3)
                            .style('fill', data.color);
                    } else {
                        data_information.select('.datatext')
                            .attr('x', xScale(timeFormat.parse(dataset.x)))
                            .attr('y', yScale(dataset.y) - 5)
                            .text(dataset.y);
                    
                        data_information.select('.datacircle')
                            .attr('cx', xScale(timeFormat.parse(dataset.x)))
                            .attr('cy', yScale(dataset.y));
                    }  
                } else {
                    data_information
                        .style('visibility', 'hidden');
                }   
            };
            
            updateDomain = function(domain){
                xDomain = domain;
                xScale.domain(domain);
                redraw();
            };
            
            //returns the closest object to the value
            function closestDataPointToValueX(object1, object2, value){
                if( null === object1){
                    if(null !== object2)
                        return object2;
                } else if(null === object2)
                    return object1;
                var xObject1 = timeFormat.parse(object1.x);
                var xObject2 = timeFormat.parse(object2.x);
                var inBetweenObjects = (xObject2 - xObject1)/2;
                if(value < new Date(xObject1.getTime() + inBetweenObjects)) return object1;
                else return object2;
            }

            svg();
            indicator();
            mapData();
            scales();
            axes();
            redraw();   
            label();
        });
    };
    
    chart.data = function(value) {
    	if (!arguments.length) return data;
    	data = value;
    	if (typeof updateData === 'function') updateData();
    	return chart;
    };
    
    chart.width = function(value) {
    	if (!arguments.length) return width;
    	width = value;
        padding = {'top': height/6, 'right': width/12, 'bottom': height/12, 'left': 40};
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
    };
    
    chart.height = function(value) {
    	if (!arguments.length) return height;
    	height = value;
        padding = {'top': height/6, 'right': width/12, 'bottom': height/12, 'left': 40};
    	if (typeof updateHeight === 'function') updateHeight();
    	return chart;
    };
    
    chart.onChildClick = function(value) {
        onChildClick = value;
        return chart;
    };
    
    chart.onChildEnter = function(value) {
        onChildEnter = value;
        return chart;
    };
    
    chart.onChildLeave = function(value) {
        onChildLeave = value;
        return chart;
    };

    chart.onChildMove = function(value) {
        onChildMove = value;
        return chart;
    };
    
    chart.onSizeChangedCallback = function(value) {
        onSizeChangedCallback = value;
        return chart;
    };
    
    chart.showDataInformation = function(value){
        showDataInformation(value);
        return chart;
    };
    
    chart.updateDomain = function(value){
        updateDomain(value);
        return chart;
    };
    
    chart.element = function(){
        return element;
    };
    
    return chart;    
}