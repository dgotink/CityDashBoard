function graph(){
    //variables
    var name;
    var label;
    var color;
    var backgroundcolor = 'white';
    var domain;
    var data;
    var element;
    var width;
    var height;
    var padding = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0};
    //update function vars
    var updateLabel;
    var updateData;
    var updateWidth;
    var updateHeight;
    var updateDomain;
    var updateColor;

    var updateBackgroundcolor;
    //indicator vars
    var moveIndicator;
    var showIndicator;
    var hideIndicator;
    //data information vars
    var moveDataInformation;
    var showDataInformation;
    var hideDataInformation;
    //mouse event vars
    var onMouseClick;
    var onMouseEnter;
    var onMouseMove;
    var onMouseLeave;
    //command vars
    var swapLinesCommand; 
    var trendFocus = false;
    //selected var
    var selected = false;
    var updateSelected;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() {
            //vars
            //mapped data vars
            var mapped_data_x;
            var mapped_data_y;
            var average_data;
            var average_domain;
            //scale vars
            var scale_x;
            var scale_y;
            var scale_color;
            //axs var
            var axis_y;
            //line function vars
            var line_animation;
            var line;   
            var trendline;
            var area;
            var trend_area;
            //svg and element var
            var svg;
            var background;
            element = this;
            var clip_linepath; 
            //draw vars
            var draw_group;
            //label var
            var label_group;
            var label_background;
            var label_text;
            //mouse information vars
            var mouse_indicator;
            var indicator_box;
            var data_information_group;
            var last_shown;

            //triangle var
            var triangle_up;
            var triangle_down;
            var triangle_top;
            var triangle_bottom;
            var triangle_size = 30;
            //timeformat var
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%L%Z');
            //bisect var
            var bisect = d3.bisector(function(d) { return timeFormat.parse(d.x); }).left;
            var bisectNoParse = d3.bisector(function(d) { return d.x; }).left;
            
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
            
                background_group = svg.append('g')
                    .attr('class', 'backgrounds');
            
                background = background_group.append('rect')
                        .attr('class', 'background')
                        .style('fill', 'none');

                var clip = svg.append('clipPath')
                        .attr('id', 'clip_' + name);
                
                clip_linepath = clip.append('rect')
                    .attr('pointer-events', 'none')
                    .style('opacity', '1')
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
                
                background
                    .attr('x', 0)
                    .attr('y', 0)
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
            
            //-------TRIANGLE METHODS-------
            function initTriangles(){
                triangle_up = d3.svg.symbol().type('triangle-up')
                    .size(triangle_size);
                                
                triangle_down = d3.svg.symbol().type('triangle-down')
                    .size(triangle_size);
                                
                triangle_top = svg.append('g')
                    .attr('class', 'triangletop')
                    .append('path')
                        .attr('class', 'trianglePath')
                        .attr('d',triangle_up)
                        .attr('fill', color);
                
                triangle_bottom = svg.append('g')
                    .attr('class', 'trianglebottom')
                    .append('path')
                        .attr('class', 'trianglePath')
                        .attr('d',triangle_down)
                        .attr('fill', color);                   
            }
            
            function updateTriangles(){ 
                if(!selected){
                   var bbox = triangle_top.node().getBBox();
                        
                    triangle_top

                        .attr('transform', 'translate(' + (padding.left + 10) + ',' + (height/2 - 2 - bbox.height/2) + ')')
                        .attr('fill', color);

                    bbox = triangle_bottom.node().getBBox();
                
                    triangle_bottom

                        .attr('transform', 'translate(' + (padding.left + 10) + ',' + (height/2 + 2 + bbox.height/2) + ')')
                        .attr('fill', color);

                } else {
                   var bbox = triangle_top.node().getBBox();
                        
                    triangle_top

                        .attr('transform', 'translate(' + (padding.left + 10) + ',' + (padding.top + 20 - bbox.height/2) + ')')
                        .attr('fill', color);

                    bbox = triangle_bottom.node().getBBox();
                
                    triangle_bottom

                        .attr('transform', 'translate(' + (padding.left + 10) + ',' + ((height-padding.bottom) - 20 + bbox.height/2) + ')')
                        .attr('fill', color);
                }
            }
            
            function rotateTriangles(){
                if(!selected){
                    triangle_top
                        .attr('d',triangle_up);
                
                    triangle_bottom
                        .attr('d',triangle_down);
                
                } else {
                    triangle_top
                        .attr('d',triangle_down);
                
                    triangle_bottom
                        .attr('d',triangle_up);
                }
            }
            
            //-------LABEL METHODS--------
            function initLabel(){
                var fontsize = 16;
                
                label_group = svg.append('g')
                    .attr('pointer-events', 'none')
                    .attr('class', 'labelgroup');
                
                label_background = label_group.append('rect')
                    .attr('class', 'labelbackground')
                    .style('fill', 'white');
                
                label_text = label_group.append('text')
                    .attr('class', 'labeltext')
                    .text(label.toUpperCase())
                    .attr('x', padding.left + 100 + 5)
                    .attr('y', padding.top + fontsize/2 + 5)

                    .style('font-size', fontsize)
                    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif;')
                    .style('fill', 'color');
            
                var bbox = label_text.node().getBBox();

                
                if(selected){
                    label_background
                        .attr('x', bbox.x - 4)
                        .attr('y', bbox.y)
                        .attr('width', bbox.width + 10)
                        .attr('height', bbox.height); 
                } else {
                    label_background
                        .attr('x', bbox.x - 5)
                        .attr('y', bbox.y)
                        .attr('width', bbox.width + 10)
                        .attr('height', bbox.height);
                } 
            }
            
            function updateLabel(){
                label_group.remove();
                initLabel();
            }
            
            //-------INDICATOR METHODS--------
            function initIndicator(){
                mouse_indicator = svg.append('rect')
                    .attr('pointer-events', 'none')
                    .attr('x', width/2)
                    .attr('y', 0)
                    .attr('width', 2)
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
            }
           
            function scales(){
                scale_x = d3.time.scale()
                    .domain(domain)
                    .range([padding.left, width - padding.right]);

            
                scale_y = d3.scale.linear()
                    .domain(d3.extent(mapped_data_y))
                    .range([height - padding.bottom, padding.top]);
            
                scale_color = d3.scale.linear()
                    .domain(d3.extent(mapped_data_y))
                    .range(['#EEEEEE', color]);               
            
                line_animation = d3.svg.line().interpolate('linear')
                    .x(function(d){ return scale_x(timeFormat.parse(d.x)); })
                    .y(function(d){ return height - padding.bottom; });  
            
                line = d3.svg.line().interpolate('linear')
                    .x(function(d){ return scale_x(timeFormat.parse(d.x)); })
                    .y(function(d){ return scale_y(d.y); }); 
            
                trendline = d3.svg.line().interpolate('linear')
                    .x(function(d){ return scale_x(d.x); })
                    .y(function(d){ return scale_y(d.y); });
            
                area = d3.svg.area()
                    .x(function(d) { return scale_x(timeFormat.parse(d.x)); })
                    .y0(height - padding.bottom)
                    .y1(function(d) { return scale_y(d.y); });
            
                trend_area = d3.svg.area()
                    .x(function(d) { return scale_x(d.x); })
                    .y0(height - padding.bottom)
                    .y1(function(d) { return scale_y(d.y); });
            }
            
            //-------AXIS METHODS--------
            function initAxis() {                
                axis_y = d3.svg.axis()
                    .scale(scale_y)
                    .orient('right')
                    .tickSize(0)
                    .tickValues(scale_y.domain());
            
                    svg.append('g')
                    .attr('class', 'axis')
                    .attr('transform', 'translate(' + padding.left + ', 0)')
                    .call(axis_y); 
            }
            
            function updateAxis() {
                axis_y.scale(scale_y);
                svg.select('g.axis').call(axis_y); 
            }
            
             //-------DRAW METHODS--------
            function draw(){
                draw_group = svg.append('g')
                    .attr('class', 'drawgroup');

                drawLine();
                if(!selected){
                    draw_group.select('.linegroup').style('visibility', 'hidden');
                    drawTiles();  
                }
            }
            
            function redraw(){
                if(!selected){
                    draw_group.select('g.linegroup').style('visibility', 'hidden');
                    drawTiles();     
                } else {
                    draw_group.select('g.linegroup').style('visibility', 'visible');
                    removeTiles(); 
                    redrawLine();
                }
            }
            
            //-------LINE METHODS--------
            function drawLine() {
                var container = draw_group.append('g')
                        .style('stroke', color)
                        .attr('pointer-events', 'none')
                        .attr('class', 'linegroup');
                
                container.append('path')
                    .style('opacity', 0.6)
                    .attr('class', 'area')
                    .attr('clip-path', 'url(#clip_' + name + ')')
                    //.style('stroke-width', 0)
                    .attr('d', area(data));
                                   
                container.append('path')
                    .attr('class', 'line')
                    .attr('clip-path', 'url(#clip_' + name + ')')
                    .style('fill', 'none')
                    .attr('d', line_animation(data))
                    //.transition().duration(1000)
                    .attr('d', line(data));
            }
            
            function redrawLine(){
                var container = draw_group.select('g.linegroup');
                
                container.selectAll('.area')
                    .attr('fill', color)
                    //.transition().duration(800)
                    .attr('d', area(data));
            
                container.selectAll('.line')
                    .attr('stroke', color)
                    //.transition().duration(800)
                    .attr('d', line(data));
            }             
            
            //-------TILES METHODS--------
            function getStepsDateArr_Domain(amount){
                var arr = [];
                var step = (domain[1]-domain[0])/amount;
                for(var i = 0; i < amount; i++){
                    var add = step * i;
                    arr[i] = new Date(domain[0].getTime() + add);
                }
                arr[amount] = domain[1];
                return arr;
            }

            function getStepsIndicesArr(date_arr){
                var arr = [];
                date_arr.forEach(function(entry, i){
                    var index = bisect(data, entry);
                    arr[i] = index;
                });               
                return arr;
            }
            
            function getAveragesArr(amount, indices_arr){
                var arr = [];
                for(var i = 0; i <= amount; i++){
                    var begin = indices_arr[i];
                    var end = indices_arr[i+1];
                    if(end === undefined) end = begin;
                    var tmp = 0;
                    var am = 0;
                    for(var ii = begin; ii <= end; ii++){
                       if(data[ii] !== undefined){
                          tmp += data[ii].y; 
                          am++; 
                       }                      
                    }                   
                    tmp = tmp/am;
                    arr[i] = tmp;
                }
                return arr;
            }
            
            function determineAveragesData(){
                var amount = 60;
                var steps_date = getStepsDateArr_Data(amount);
                var steps_indices = getStepsIndicesArr(steps_date);
                var averages = getAveragesArr(amount, steps_indices);
                average_data = [];
                
                for(var i = 0; i < averages.length; i++){
                    var entry = {};
                    entry['x'] = steps_date[i];
                    entry['y'] = averages[i];
                    if(isNaN(entry['y']))
                       entry['y'] = averages[i-1]; 
                    average_data[i] = entry;
                }
            }
            
            function determineAveragesDomain(){
                var amount = 60;
                var steps_date = getStepsDateArr_Domain(amount);
                var steps_indices = getStepsIndicesArr(steps_date);
                var averages = getAveragesArr(amount, steps_indices);
                average_domain = [];
                
                for(var i = 0; i < averages.length; i++){
                    var entry = {};
                    entry['x'] = steps_date[i];
                    entry['y'] = averages[i];
                    if(isNaN(entry['y']))
                       entry['y'] = averages[i-1]; 
                    average_domain[i] = entry;
                }
            }
            
            function drawTiles() {
                removeTiles();
                determineAveragesDomain();

                var container = draw_group.append('g')
                        .attr('pointer-events', 'none')
                        .attr('class', 'tiles');
               
                for(var i = 0; i < average_domain.length; i++){
                    //find the middle between 2 points (tiles are drawn from the middle of 2 points to another middle)
                    var current = scale_x(average_domain[i].x);
                    var prev = average_domain[i-1];
                    if(prev !== undefined)
                        prev = scale_x(prev.x);
                    else prev = current;
                    var next = average_domain[i+1];
                    if(next !== undefined)
                        next = scale_x(next.x);
                    else next = current;
                    
                    var x1 = Math.floor((prev + current)/2);
                    var x2 = Math.ceil((current + next)/2);
                    
                    var tmp_width = x2 - x1;
                    
                    var color = scale_color(average_domain[i].y);
                    if(color === '#NaNNaNNaN')
                        color = backgroundcolor;

                    container.append('rect')
                            .attr('class', 'tile')
                            .attr('x', x1)
                            .attr('width', tmp_width)
                            .attr('y', padding.top)
                            .attr('height', height - padding.bottom - padding.top)
                            .style('fill', color);
                }
            }
            
            function removeTiles(){
                draw_group.select('.tiles').remove();
            }
            
            //-------DATA INFORMATION METHODS--------
            function initDataInformation(){
                data_information_group = svg.append('g')
                    .attr('pointer-events', 'none')
                    .attr('class', 'data_information')
                    .style('visibility', 'hidden');
            
                data_information_group.append('rect')
                    .attr('class', 'databox')
                    .style('fill', 'white')
                    .style('stroke', color)
                    .style('stroke-width', 1);
                
                data_information_group.append('text')
                    .attr('class', 'datatext');

                data_information_group.append('circle')
                    .attr('class', 'datacircle')
                    .attr('r', 3)
                    .style('fill', color);
            }
            
            showDataInformation = function(){
                if(selected)
                    data_information_group
                        .style('visibility', 'visible');
            };
            
            hideDataInformation = function(){
                data_information_group
                    .style('visibility', 'hidden');
            };
            
            moveDataInformation = function(position){
                var currentdata = data;
                var date =  scale_x.invert(position);
                var index = 0;
                if(trendFocus){
                    currentdata = average_data;
                    index = bisectNoParse(currentdata, date);
                } else {
                    index = bisect(currentdata, date);
                }
                var dataset = closestDataPointToValueX(currentdata[index-1], currentdata[index], date); 
                var datasetX;
                if(trendFocus) datasetX = dataset.x;
                else datasetX = timeFormat.parse(dataset.x);
                
                if(dataset.x !== last_shown){
                    last_shown = dataset.x;
                    var txt = data_information_group.select('.datatext')
                        .attr('text-anchor', 'start')
                        .attr('x', scale_x(datasetX) + 20)
                        .attr('y', scale_y(dataset.y) + 4)
                        .text(dataset.y.toFixed(2));
            
                    var bounding_box = txt.node().getBBox();
                
                    if(bounding_box.x + bounding_box.width > width){
                        txt
                            .attr('x', scale_x(datasetX) - 20)
                            .attr('y', scale_y(dataset.y) + 4)
                            .attr('text-anchor', 'end');
                
                        bounding_box = txt.node().getBBox();
                    }
                
                    data_information_group.select('.databox')
                        .attr('x', bounding_box.x -5)
                        .attr('y', bounding_box.y -2)
                        .attr('width', bounding_box.width +10)
                        .attr('height', bounding_box.height +4);
                    
                    data_information_group.select('.datacircle')
                        .attr('cx', scale_x(datasetX))
                        .attr('cy', scale_y(dataset.y)); 
                }
            };
            
            //returns the closest of the two objects to the value
            function closestDataPointToValueX(object1, object2, value){
                if( undefined === object1){
                    if(undefined !== object2)
                        return object2;
                } else if(undefined === object2)
                    return object1;
                else {
                    if(trendFocus){
                        var xObject1 = object1.x;
                        var xObject2 = object2.x;
                    } else {
                        var xObject1 = timeFormat.parse(object1.x);
                        var xObject2 = timeFormat.parse(object2.x);
                    }
                    var inBetweenObjects = (xObject2 - xObject1)/2;
                    if(value < new Date(xObject1.getTime() + inBetweenObjects)) return object1;
                        else return object2;
                } 
            }         
            
            //-------TRENDLINE METHODS--------
            function initTrendline(){
		var trendlineg = svg.append('g')

                        .attr('pointer-events', 'none')

                        .attr('class', 'trendlinegroup')
                        .style('stroke', color)
                        .style('opacity', 0.2);
                
                trendlineg.append('path')
                    .style('opacity', 0.6)
                    .attr('class', 'area')
                    .style('stroke-width', 0);
			
		trendlineg.append('path')
			.attr('class', 'trendline')
                        .attr('clip-path', 'url(#clip_' + name + ')')
			.attr('stroke-width', 1.5) 
                        .style('fill', 'none');
            }
            
            function updateTrendline(){
                determineAveragesData();
                
                var trendlineg = svg.select('g.trendlinegroup');

                trendlineg.selectAll('.area')
                    .style('fill', color)
                    .attr('clip-path', 'url(#clip_' + name + ')')
                    //.transition().duration(800)
                    .attr('d', trend_area(average_data));
			
		trendlineg.select('.trendline')
                        .style('stroke', color)
			.attr('d', trendline(average_data)); 
            }
            
            function getStepsDateArr_Data(amount){               
                var arr = [];
                var step = (timeFormat.parse(data[data.length-1].x)-timeFormat.parse(data[0].x))/amount;
                for(var i = 0; i < amount; i++){
                    var add = step * i;
                    arr[i] = new Date(timeFormat.parse(data[0].x).getTime() + add);
                }
                if(domain[1] <= timeFormat.parse(data[data.length-1].x))
                    arr[amount] = domain[1];
                else 
                    arr[amount] = timeFormat.parse(data[data.length-1].x);
                return arr;
            }

            //-------ON EVENTS--------
            function onClick(){
                onMouseClick(name);
            }
            
            function onEnter(){
                onMouseEnter();
            }
            
            function onMove(){
                var position = d3.mouse(this)[0];
                if(position < padding.left)
                    position = padding.left;
                else if(position > width - padding.right)
                    position = width - padding.right;
                var value = scale_x.invert(position);
                onMouseMove(position, value);
            }
            
            function onLeave(){
                onMouseLeave();
            }
            
            //FUNCTION TO CHANGE THE FOCUS ON THE TRENDLINE OR THE ACTUAL DATA LINE
            swapLinesCommand = function(){
                if(trendFocus){
                    trendFocus = false;
                       svg.select('g.trendlinegroup')
                            .transition().duration(1000)
                            .style('opacity', 0.2);
                        svg.select('g.linegroup')
                            .transition().duration(1000)
                            .style('opacity', 1);            
                } else {
                    trendFocus = true;
                       svg.select('g.trendlinegroup')
                            .transition().duration(1000)
                            .style('opacity', 1);
                        svg.select('g.linegroup')
                            .transition().duration(1000)
                            .style('opacity', 0.2); 
                }
            };
            
            //-------UPDATE EVENTS--------
            updateDomain = function(){
                scale_x.domain(domain);
                updateAxis();
                redraw();
                if(selected)
                    updateTrendline();
            };
            
            updateData = function(){
                mapData();
                scales();
                updateAxis();
                redraw();
                updateTrendline();
            };
            
            updateWidth = function(){
                updateSvg();
                updateTriangles();
                scales();
                updateAxis();
                redraw();
                updateTrendline();
                updateLabel();
            };
            
            updateHeight = function(){
                updateSvg();
                updateTriangles();
                scales();
                updateAxis();
                redraw();
                updateIndicator();
                updateTrendline();
                updateLabel();
            };
            
            updateSelected = function(){
                if(!selected){
                    svg.select('g.trendlinegroup').style('visibility', 'hidden');
                    svg.select('.axis').style('visibility', 'hidden');
                    hideDataInformation();
                } else {
                    svg.select('g.trendlinegroup').style('visibility', 'visible');
                    svg.select('.axis').style('visibility', 'visible');
                    showDataInformation();
                }
                rotateTriangles();
                redraw();
            };
            
            updateColor = function(){
                scales();
                redraw();
                updateTriangles();
            };

            updateBackgroundcolor = function(){
                background
                    .style('fill', backgroundcolor);
                redraw();
            };

            function init(){
                initSvg();
                
                mapData();
                scales();
                initAxis();
                draw();
                initTriangles();
                initLabel();
                initIndicator();
                initTrendline();
                initDataInformation();    
                if(trendFocus){
                    trendFocus = false;
                    swapLinesCommand();
                }
                updateSelected();
            }          
            init();
          
        });
    };
    
    chart.setName = function(value){
        name = value;
        return chart;
    };
    
    chart.setLabel = function(value){
        label = value;
        return chart;
    };
    
    chart.setColor = function(value){
        color = value;
        if (typeof updateColor === 'function') updateColor();
        return chart;
    };
    
    chart.setBackgroundcolor = function(value){
        backgroundcolor = value;
        if (typeof updateBackgroundcolor === 'function') updateBackgroundcolor();
        return chart;
    };
    
    chart.setBackgroundcolor = function(value){
        backgroundcolor = value;
        if (typeof updateBackgroundcolor === 'function') updateBackgroundcolor();
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
    
    chart.getElement = function(){
        return element;
    };
    
    chart.setWidth = function(value){
        width = value;
        padding = {'top': height/18, 'right': 10, 'bottom': height/18, 'left': 10};
        if (typeof updateData === 'function') updateWidth();
        return chart;      
    };
    
    chart.setHeight = function(value){
        height = value;
        padding = {'top': height/18, 'right': 10, 'bottom': height/18, 'left': 10};
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
        if (typeof moveIndicator === 'function' && selected)
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
     
    chart.swapLines = function(){
        swapLinesCommand();
        return chart;
    };
    
    chart.setTrendFocus = function(value){
        trendFocus = value;
        return chart;
    };
    
    chart.setSelected = function(value){
        selected = value;
        updateSelected();
        return chart;
    };
    
    return chart;
}
