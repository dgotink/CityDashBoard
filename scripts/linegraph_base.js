function linegraph_base(){
    //variables
    var name;
    var color;
    var domain;
    var data;
    var width;
    var height;
    var padding = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0};
    
    var updateData;
    var updateWidth;
    var updateHeight;
    var updateDomain;
    
    var moveIndicator;
    var showIndicator;
    var hideIndicator;
    
    var moveDataInformation;
    var showDataInformation;
    var hideDataInformation;
    
    var onMouseClick;
    var onMouseEnter;
    var onMouseMove;
    var onMouseLeave;


    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() {
            //vars
            //mapped data vars
            var mapped_data_x;
            var mapped_data_y;
            var data_trendline;
            //scale vars
            var scale_x;
            var scale_y;
            //axs var
            var axis_y;
            //line function vars
            var line_animation;
            var line;          
            //svg and element var
            var svg;
            var clip_linepath;
            var element = this;
            //label var
            var label;
            //mouse information vars
            var mouse_indicator;
            var indicator_box;
            var data_information_group;
            //timeformat var
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');
            //bisect var
            var bisect = d3.bisector(function(d) { return timeFormat.parse(d.x); }).left;
            
            //-------SVG METHODS--------
            function initSvg(){
                //make the svg
                svg = d3.select(element)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'svgbox')
                    .style('display', 'block')
                    .on('click', onClick);
            
                var clip = svg.append('clipPath')
                        .attr('id', 'clip_' + name);
                
                clip_linepath = clip.append('rect')
                    .attr('pointer-events', 'none')
                    .style('opacity', '0')
                    .attr('x', padding.left)
                    .attr('y', 0)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height);
                        
                indicator_box = svg.append('rect')
                    .style('opacity', '0')
                    .attr('x', padding.left)
                    .attr('y', 0)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height)
                    .on('mouseenter', onEnter)
                    .on('mouseleave', onLeave)
                    .on('mousemove', onMove);                   
            }
            
            function updateSvg(){
                svg
                    //.transition().duration(1000)
                    .attr('width', width)
                    .attr('height', height);
            
                clip_linepath
                    .attr('x', padding.left)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height);
            
                indicator_box
                    .attr('x', padding.left)
                    .attr('y', 0)
                    .attr('width', width - padding.left - padding.right)
                    .attr('height', height);               
            }
            
            //-------LABEL METHODS--------
            function initLabel(){
                var margin = 10;
                label = svg.append('text')
                    .attr('class', 'label')
                    .style('font-family', 'Helvetica, Arial, sans-serif')
                    .style('font-size','12px')
                    .style('fill', color)
                    .text(name)
                    .attr('x', (width - padding.right) + margin)
                    .attr('y', height);
            }
            
            function updateLabel() {  
                var value = domain[1];
                var index = bisect(data, value);
                label
                    .transition().duration(800)
                    .attr('y', scale_y(data[index].y));
            }
            
            //-------INDICATOR METHODS--------
            //initiliaze the mouse_indicator rectangle
            function initIndicator(){
                mouse_indicator = svg.append('rect')
                    .attr('pointer-events', 'none')
                    .attr('x', width/2)
                    .attr('y', 0)
                    .attr('width', 1)
                    .attr('height', height)
                    .attr('class', 'mouse_indicator')
                    .style('shape-rendering', 'crispEdges')
                    .style('fill', 'lightgray')
                    .style('visibility', 'hidden');
            }
            
            moveIndicator = function(position){
                mouse_indicator
                    .attr('x', position);
            };
            
            showIndicator = function(){
                mouse_indicator
                    .style('visibility', 'visible');
            };
            
            hideIndicator = function(){
                mouse_indicator
                    .style('visibility', 'hidden');
            };
            
            function updateIndicator(){
                mouse_indicator
                    .attr('height', height);
            }
            
            //-------SCALE METHODS--------
            function mapData(){
                mapped_data_x = data.map(function(d) { return timeFormat.parse(d.x); });
                mapped_data_y = data.map(function(d) { return d.y; });
                
                var series_x = d3.range(1, mapped_data_x.length + 1);
                data_trendline = leastSquares(series_x, mapped_data_y);
            }
            
            function initTrendline(){
		var trendline = svg.append('g')
                        .attr('class', 'trendlinegroup');
			
		trendline.append('line')
			.attr('class', 'trendline')
			.attr('stroke', color)
			.attr('stroke-width', 1.5)
                        .style('opacity', 0.2);
            }
            
            function updateTrendline(){
                // apply the reults of the least squares regression            
		var x1 = mapped_data_x[0];
		var y1 = data_trendline[0] + data_trendline[1];
		var x2 = mapped_data_x[mapped_data_x.length - 1];
		var y2 = data_trendline[0] * mapped_data_x.length + data_trendline[1];              
		
		var trendline = svg.select('g.trendlinegroup')
			
		trendline.select('.trendline')
			.attr('x1', scale_x(x1)).attr('y1', scale_y(y1))
                        .attr('x2', scale_x(x2)).attr('y2', scale_y(y2))
            }
            
            function scales(){
                scale_x = d3.time.scale()
                    .domain(domain)
                    .range([padding.left, width - padding.right]);

            
                scale_y = d3.scale.linear()
                    .domain(d3.extent(mapped_data_y))
                    .range([height - padding.bottom, padding.top]);
            
                line_animation = d3.svg.line().interpolate('linear')
                    .x(function(d){ return scale_x(timeFormat.parse(d.x)); })
                    .y(function(d){ return height - padding.bottom; });  
            
                line = d3.svg.line().interpolate('linear')
                    .x(function(d){ return scale_x(timeFormat.parse(d.x)); })
                    .y(function(d){ return scale_y(d.y); });  
            }
            
            //-------AXIS METHODS--------
            function initAxis() {                
                axis_y = d3.svg.axis()
                    .scale(scale_y)
                    .orient("left")
                    .tickSize(0)
                    .tickValues(scale_y.domain());
            
                    svg.append('g')
                    .attr('class', 'axis')
                    .attr('transform', 'translate(' + padding.left + ', 0)')
                    .call(axis_y); 
            }
            
            function updateAxis() {
                axis_y.scale(scale_y);
                /*var t = svg.transition().duration(800);
                t.select('g.axis').call(axis_y); */
                svg.select('g.axis').call(axis_y);
                
            }
            
            //-------LINE METHODS--------
            function draw() {
                var container = svg.append('g')
                        .style('stroke', color)
                        .attr('pointer-events', 'none')
                        .attr('class', 'line');
                                   
                container.append('path')
                    .attr('clip-path', 'url(#clip_' + name + ')')
                    .attr('d', line_animation(data))
                    //.transition().duration(1000)
                    .attr('d', line(data));
            }
            
            function redraw(){
                var container = svg.select('g.line');
                
                container.select('path')
                    //.transition().duration(800)
                    .attr('d', line(data));
            }
            
            //-------DATA INFORMATION METHODS--------
            function initDataInformation(){
                data_information_group = svg.append('g')
                    .attr("pointer-events", "none")
                    .attr('class', 'data_information')
                    .style('visibility', 'hidden');
                
                data_information_group.append('text')
                    .attr('class', 'datatext');
            
                data_information_group.append('circle')
                    .attr('class', 'datacircle')
                    .attr('r', 3)
                    .style('fill', color);
            }
            
            showDataInformation = function(){
                data_information_group
                    .style('visibility', 'visible');
            };
            
            hideDataInformation = function(){
                data_information_group
                    .style('visibility', 'hidden');
            };
            
            moveDataInformation = function(position){
                var date =  scale_x.invert(position);
                var index = bisect(data, date);
                var dataset = closestDataPointToValueX(data[index-1], data[index], date); 

                data_information_group.select('.datatext')
                    .attr('x', scale_x(timeFormat.parse(dataset.x)))
                    .attr('y', scale_y(dataset.y) - 5)
                    .text(dataset.y);
                    
                data_information_group.select('.datacircle')
                    .attr('cx', scale_x(timeFormat.parse(dataset.x)))
                    .attr('cy', scale_y(dataset.y));
            };
      
            //-------ON EVENTS--------
            function onClick(){
                onMouseClick(name);
            }
            
            function onEnter(){
                onMouseEnter();
            }
            
            function onMove(){
                var position = d3.mouse(this)[0];
                onMouseMove(position);
            }
            
            function onLeave(){
                onMouseLeave();
            }
            
            //-------UPDATE EVENTS--------
            updateDomain = function(){
                scale_x.domain(domain);
                updateAxis();
                updateLabel();
                redraw();
                updateTrendline();
            };
            
            updateData = function(){
                mapData();
                scales();
                updateAxis();
                redraw();
                updateLabel();
                updateTrendline();
            };
            
            updateWidth = function(){
                updateSvg();
                scales();
                updateAxis();
                redraw();
                updateLabel();
                updateTrendline();
            };
            
            updateHeight = function(){
                updateSvg();
                scales();
                updateAxis();
                redraw();
                updateLabel();
                updateIndicator();
                updateTrendline();
            };

            initSvg();
            mapData();
            scales();
            initAxis();
            draw();
            initLabel();
            initIndicator();
            initDataInformation();
            initTrendline();
            
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
        });
    };
    
    chart.setName = function(value){
        name = value;
        return chart;
    };
    
    chart.setColor = function(value){
        color = value;
        return chart;
    };
    
    chart.setDomain = function(value){
        domain = value;
        if (typeof updateData === 'function') updateDomain();
        return chart;
    };
    
    chart.setData = function(value){
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };
    
    chart.setWidth = function(value){
        width = value;
        padding = {'top': height/6, 'right': width/12, 'bottom': height/12, 'left': 40};
        if (typeof updateData === 'function') updateWidth();
        return chart;      
    };
    
    chart.setHeight = function(value){
        height = value;
        padding = {'top': height/6, 'right': width/12, 'bottom': height/12, 'left': 40};
        if (typeof updateData === 'function') updateHeight();
        return chart;
    };
    
    chart.moveIndicator = function(value){
        if (typeof moveIndicator === 'function')
            moveIndicator(value);
        return chart;
    };
    
    chart.showIndicator = function(){
        if (typeof showIndicator === 'function')
            showIndicator();
        return chart;
    };
    
    chart.hideIndicator = function(){
        if (typeof hideIndicator === 'function')
            hideIndicator();
        return chart;
    };
    
    chart.moveDataInformation = function(value){
        if (typeof moveIndicator === 'function')
            moveDataInformation(value);
        return chart;
    };
    
    chart.showDataInformation = function(){
        if (typeof showDataInformation === 'function')
            showDataInformation();
        return chart;
    };
    
    chart.hideDataInformation = function(){
        if (typeof hideDataInformation === 'function')
            hideDataInformation();
        return chart;
    };
    
    chart.setOnClick = function(value){
        onMouseClick = value;
        return chart;
    };
    
    chart.setOnMouseEnter = function(value){
        onMouseEnter = value;
        return chart;
    };
    
    chart.setOnMouseMove = function(value){
        onMouseMove = value;
        return chart;
    };
    
    chart.setOnMouseLeave = function(value){
        onMouseLeave = value;
        return chart;
    };
     
    return chart;
}
