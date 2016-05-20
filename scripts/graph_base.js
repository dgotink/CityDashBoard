function graph_base(){
    //variables
    var name;
    var color;
    var domain;
    var data;
    var element;
    var width;
    var height;
    var padding = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0};
    //update function vars
    var updateData;
    var updateWidth;
    var updateHeight;
    var updateDomain;
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
    //button event vars
    var onButtonClick;
    //command vars
    var swapLinesCommand;    
    //constant value vars
    var MINIMUM_SIZE_NEEDED_FOR_LINE = 50;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() {
            //vars
            //mapped data vars
            var mapped_data_x;
            var mapped_data_y;
            //scale vars
            var scale_x;
            var scale_y;
            var scale_color;
            //axs var
            var axis_y;
            //line function vars
            var line_animation;
            var line;          
            //svg and element var
            var svg;
            element = this;
            var clip_linepath;           
            //label var
            var label;
            //mouse information vars
            var mouse_indicator;
            var indicator_box;
            var data_information_group;
            //button vars
            var button_group;
            var button_clicked = false;
            //command vars
            var trendFocus = false;
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
            
            //-------BUTTON METHODS--------
            function button(){
                button_group = svg.append('g')
                        .attr('class', 'button-group');
                
                button_group.append('rect')
                        .attr('class', 'button')
                        .attr('x', 5)
                        .attr('y', 5)
                        .attr('width', 25)
                        .attr('height', 25)
                        .style('fill', 'black')
                        .on('click', buttonClicked);
            }
            
            function buttonClicked(){
                //stop the svg element's on click event
                event.stopPropagation();
                if(button_clicked)
                    button_clicked = false;
                else
                    button_clicked = true;
                onButtonClick(name, button_clicked);
                updateButton();
            }
            
            function updateButton(){
                var color;
                if(button_clicked)
                    color = 'green';
                else
                    color = 'red';
                button_group.select('.button')
                        .style('fill', color);                
            }
            
            //-------LABEL METHODS--------
            function initLabel(){
                var margin = 10;
                label = svg.append('text')
                    .attr('class', 'label')
                    .style('font-family', 'inherit')
                    .style('fill', color)
                    .text(name)
                    .attr('x', (width - padding.right) + margin)
                    .attr('y', height);
            }
            
            function updateLabel() {  
                if(height >= MINIMUM_SIZE_NEEDED_FOR_LINE){
                    var value = domain[1];
                    var index = bisect(data, value);
                    label
                        .transition().duration(800)
                        .attr('y', scale_y(data[index].y));
                } else {
                    label
                        .transition().duration(800)
                        .attr('y', height/2);
                }             
            }
            
            //-------INDICATOR METHODS--------
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
                svg.select('g.axis').call(axis_y);
                
            }
            
             //-------DRAW METHODS--------
            function draw(){
                drawLine();
                if(height < MINIMUM_SIZE_NEEDED_FOR_LINE){
                    svg.select('.line').style('visibility', 'hidden');
                    drawTiles();  
                }
            }
            
            function redraw(){
                if(height < MINIMUM_SIZE_NEEDED_FOR_LINE){
                    svg.select('.line').style('visibility', 'hidden');
                    drawTiles();     
                } else {
                    svg.select('.line').style('visibility', 'visible');
                    removeTiles(); 
                    redrawLine();
                }
            }
            
            //-------LINE METHODS--------
            function drawLine() {
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
            
            function redrawLine(){
                var container = svg.select('g.line');
                
                container.selectAll('path')
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
            
            function drawTiles() {
                var amount = 100;
                var steps_date = getStepsDateArr_Domain(amount);
                var steps_indices = getStepsIndicesArr(steps_date);
                var averages = getAveragesArr(amount, steps_indices);
                removeTiles();
                
                var container = svg.append('g')
                        .attr('pointer-events', 'none')
                        .attr('class', 'tiles');
               
                for(var i = 0; i <= amount; i++){
                    //find the middle between 2 points (tiles are drawn from the middle of 2 points to another middle)
                    var current = scale_x(steps_date[i]);
                    var prev = steps_date[i-1];
                    if(prev !== undefined)
                        prev = scale_x(prev);
                    else prev = current;
                    var next = steps_date[i+1];
                    if(next !== undefined)
                        next = scale_x(next);
                    else next = current;
                    
                    var x1 = (prev + current)/2;
                    var x2 = (current + next)/2;
                    
                    var tmp_width = x2 - x1;

                    container.append('rect')
                            .attr('class', 'tile')
                            .attr('x', x1)
                            .attr('width', tmp_width)
                            .attr('y', padding.top)
                            .attr('height', height - padding.bottom - padding.top)
                            .style('fill', scale_color(averages[i]));
                }
            }
            
            function removeTiles(){
                svg.select('.tiles').remove();
            }
            
            //-------DATA INFORMATION METHODS--------
            function initDataInformation(){
                data_information_group = svg.append('g')
                    .attr("pointer-events", "none")
                    .attr('class', 'data_information')
                    .style('visibility', 'hidden');
            
                data_information_group.append('rect')
                    .attr('class', 'databox')
                    .style('fill', 'white')
                    //.style('opacity', '0.5')
                    .style('stroke', color)
                    .style('stroke-width', 1);
                
                data_information_group.append('text')
                    .attr('class', 'datatext');

                data_information_group.append('circle')
                    .attr('class', 'datacircle')
                    .attr('r', 3)
                    .style('fill', color);
            
                data_information_group.append('line')
                    .attr('class', 'dataline')
                    .style('stroke', color);
            }
            
            showDataInformation = function(){
                if(height >= MINIMUM_SIZE_NEEDED_FOR_LINE && trendFocus !== true)
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

                var txt = data_information_group.select('.datatext')
                    .attr('x', scale_x(timeFormat.parse(dataset.x)) + 20)
                    .attr('y', scale_y(dataset.y) + 4)
                    .text(dataset.y.toFixed(2));
            
                var bounding_box = txt.node().getBBox();
                
                data_information_group.select('.databox')
                    .attr('x', bounding_box.x -5)
                    .attr('y', bounding_box.y -2)
                    .attr('width', bounding_box.width +10)
                    .attr('height', bounding_box.height +4);
                    
                data_information_group.select('.datacircle')
                    .attr('cx', scale_x(timeFormat.parse(dataset.x)))
                    .attr('cy', scale_y(dataset.y));
            
                data_information_group.select('.dataline')
                    .attr('x1', scale_x(timeFormat.parse(dataset.x)))
                    .attr('x2', bounding_box.x -5)
                    .attr('y1', scale_y(dataset.y))
                    .attr('y2', scale_y(dataset.y));
            };
            
            //returns the closest of the two objects to the value
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
            
            //-------TRENDLINE METHODS--------
            function initTrendline(){
		var trendline = svg.append('g')
                        .attr('class', 'trendlinegroup')
                        .style('stroke', color)
                        .style('opacity', 0.2);
			
		trendline.append('path')
			.attr('class', 'trendline')
                        .attr('clip-path', 'url(#clip_' + name + ')')
			.attr('stroke-width', 1.5) 
                        .style('fill', 'none');
            }
            
            function updateTrendline(){
                var amount = 50;
                var steps_date = getStepsDateArr_Data(amount);
                var steps_indices = getStepsIndicesArr(steps_date);
                var averages = getAveragesArr(amount, steps_indices);
                
                var tmp_data = [];
                for(var i = 0; i <= amount; i++){
                    tmp_data.push({'x': steps_date[i].toISOString(), 'y':averages[i]});
                }
                
                var trendline = svg.select('g.trendlinegroup');
			
		trendline.select('.trendline')
			.attr('d', line(tmp_data)); 
            }
            
            function getStepsDateArr_Data(amount){               
                var arr = [];
                var step = (timeFormat.parse(data[data.length-1].x)-timeFormat.parse(data[0].x))/amount;
                for(var i = 0; i < amount; i++){
                    var add = step * i;
                    arr[i] = new Date(timeFormat.parse(data[0].x).getTime() + add);
                }
                arr[amount] = domain[1];
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
                onMouseMove(position);
            }
            
            function onLeave(){
                onMouseLeave();
            }
            
            //
            swapLinesCommand = function(){
                if(trendFocus){
                    trendFocus = false;

                       svg.select('g.trendlinegroup')
                            .transition().duration(1000)
                            .style('opacity', 0.2);
                        svg.select('g.line')
                            .transition().duration(1000)
                            .style('opacity', 1); 
                                       
                } else {
                    trendFocus = true;

                       svg.select('g.trendlinegroup')
                            .transition().duration(1000)
                            .style('opacity', 1);
                        svg.select('g.line')
                            .transition().duration(1000)
                            .style('opacity', 0.2); 
                    
                }
            };
            
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
                checkMinimunHeightRequirements();
            };
            
            function checkMinimunHeightRequirements(){
                if(height < MINIMUM_SIZE_NEEDED_FOR_LINE){
                    svg.select('g.trendlinegroup').style('visibility', 'hidden');
                    svg.select('.axis').style('visibility', 'hidden');
                    hideDataInformation();
                } else {
                    svg.select('g.trendlinegroup').style('visibility', 'visible');
                    svg.select('.axis').style('visibility', 'visible');
                    showDataInformation();
                }
            }

            function init(){
                initSvg();
                button();
                mapData();
                scales();
                initAxis();
                draw();
                initLabel();
                initIndicator();
                initTrendline();
                initDataInformation();               
            }
            
            init();
          
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
    
    chart.getElement = function(){
        return element;
    };
    
    chart.setWidth = function(value){
        width = value;
        padding = {'top': height/12, 'right': width/12, 'bottom': height/12, 'left': 40};
        if (typeof updateData === 'function') updateWidth();
        return chart;      
    };
    
    chart.setHeight = function(value){
        height = value;
        padding = {'top': height/12, 'right': width/12, 'bottom': height/12, 'left': 40};
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
    
    chart.setOnButtonClick = function(value){
        onButtonClick = value;
        return chart;
    };
     
    chart.swapLines = function(){
        swapLinesCommand();
        return chart;
    };
    
    return chart;
}
