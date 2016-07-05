function graph_context(){
    //variables
    var width;
    var height;
    var padding = {'top': 0, 'right': 120, 'bottom': 10, 'left': 40};
    
    var data = [];   
    
    var updateData;
    var updateWidth;
    var updateHeight;
    
    var onChildBrushed;
    
    //data information vars
    var moveDataInformation;
    var showDataInformation;
    var hideDataInformation;
    
    var domain;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //data vars
            var mapX;
            //scale vars
            var xScale;
            var pixels_rect_width;
            //axis var
            var axis_hour;
            var axis_day;
            var axis_label;
            //svg var
            var svg;
            var element = this;
            //brush var for choosing the focus
            var brush;
<<<<<<< HEAD
            //
            var data_information_group;
            var last_shown;
            //timeformat vars
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%L%Z');
            var timeDisplayFormat = d3.time.format('%H:%M');
            //bisect var
            var bisect = d3.bisector(function(d) { return d; }).left;
=======
            //timeformat var
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%L%Z');
>>>>>>> 750b2b495aa6ed04c1a21236c3eac717de8d9f18

            //makes and appends the svg to the element and adds buttons 
            function svg(){
                //make the svg
                svg = d3.select(element)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'svgbox');
                
                svg.append('rect')
                    .attr('class', 'background')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', '#17141f')
                    .style('stroke', 'white')
                    .style('stroke-width', 1.5);                             
            }

            function updateSvg() {
                svg
                    //.transition().duration(1000)
                    .attr("width", width)
                    .attr("height", height);
            
                svg.select('.background')
                    .attr("width", width)
                    .attr("height", height);               
            }
            
            function rearrangeData(){
               var tmp = [];
               for(key in data){
                   tmp.push(data[key]);
               } 
               data = tmp;
            }
            
            function mapData() {
                
                var mergedMap = d3.merge(data.map(function (d) { return d; }));
                mapX = mergedMap.map(function(d) { return timeFormat.parse(d.x); });
            }
                        
            function scales() {
                xScale = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([padding.left, width - padding.right]); 
            
                var millis = ((1000 * 60) * 60) * 3;
                var begin = Date.now();
                var end = begin;
                end += millis;
                end = new Date(end);
                pixels_rect_width = xScale(end) - xScale(new Date(begin));
            
                domain = xScale.domain();
            }
            
            function axes() {                
                axis_hour = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(d3.time.hour, 3)
                    .tickFormat('') 
                    .tickSize(8, 0);
                    
            
                axis_day = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(d3.time.day, 1)
                    .tickFormat('') 
                    .tickSize(30, 0);
            
                axis_label = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(d3.time.hour, 12)
                    .tickSize(0)
                    .tickPadding(30)
                    .tickFormat(function (d) {
                        if(d.getHours() === 12){
                            if(d.getDate() === 1 || d.getDate() === xScale.domain()[0].getDate()){
                                formatter = d3.time.format.utc('%a %d %b');
                            }
                            else {
                                formatter = d3.time.format.utc('%a %d');
                            }
                            var str = formatter(d);
                            return str.toUpperCase();
                        }
                        else
                            return null;
                       
                    });
            
                svg.append('g')
                    .style('stroke', 'white')
                    .attr('pointer-events', 'none')
                    .attr('class', 'controller-axis hours')
                    .call(axis_hour); 
            
                svg.append('g')
                    .style('stroke', 'white')
                    .attr('pointer-events', 'none')
                    .attr('class', 'controller-axis days')
                    .call(axis_day); 
            
                svg.append('g')
                    .style('stroke', 'white')
                    .attr('pointer-events', 'none')
                    .attr('class', 'controller-axis-label')
                    .call(axis_label); 
            
                addHourRects();
            }
            
            function addHourRects(){
                svg.select('g.hours').selectAll('g.tick')
                    .insert('rect', ':first-child')
                    .attr('class', function(d){
                        hours = d.getHours();
                        if(hours < 6 || hours >= 18)
                            return 'nighttime'
                        else
                            return 'daytime'
                    })
                    .attr('x', 0)
                    .attr('width', pixels_rect_width)
                    .attr('height', 8);    
            }

            function updateAxes() {
                axis_hour
                    .scale(xScale);
                svg.select('g.hours')
                   .call(axis_hour);
           
                axis_day
                    .scale(xScale);
                svg.select('g.days')
                   .call(axis_day);
           
                axis_label
                    .scale(xScale);
                svg.select('g.axis_label')
                   .call(axis_label);
            }
            
            function initBrush(){
                brush = d3.svg.brush()
                        .on('brush', onBrush);
                
                brush.x(xScale);
                
                svg.append('g')
                    .attr('class', 'brush')
                    .call(brush)
                    .selectAll('rect')
                        .style('fill', 'white')  
                        .attr('y', 0)
                        .attr('height', height);
            }
            
            function updateBrush(){
                brush.x(xScale);
                
                svg.select('g.brush')
                    .call(brush);
            }
            
            function onBrush() {
                if(brush.empty())
                   domain = xScale.domain();
                else {
                    domain = brush.extent();
                }
                onChildBrushed(domain);
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
                    //.style('opacity', '0.5')
                    .style('stroke', 'black')
                    .style('stroke-width', 1);
                
                data_information_group.append('text')
                    .attr('class', 'datatext');
            
                data_information_group.append('circle')
                    .attr('class', 'datacircle')
                    .attr('r', 3)
                    .style('fill', 'black');
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
                var date =  xScale.invert(position);
                var index = bisect(mapX, date);
                var dataset = closestDataPointToValueX(mapX[index-1], mapX[index], date); 
                
                if(dataset !== last_shown){
                    last_shown = dataset;
                    var txt = data_information_group.select('.datatext')
                        .attr('text-anchor', 'start')
                        .attr('x', xScale(dataset) + 20)
                        .attr('y', 20)
                        .text(timeDisplayFormat(dataset));
            
                    var bounding_box = txt.node().getBBox();
                
                    if(bounding_box.x + bounding_box.width > width){
                        txt
                            .attr('x', xScale(dataset) - 20)
                            .attr('text-anchor', 'end');
                
                        bounding_box = txt.node().getBBox();
                    }
                
                    data_information_group.select('.databox')
                        .attr('x', bounding_box.x -5)
                        .attr('y', bounding_box.y -2)
                        .attr('width', bounding_box.width +10)
                        .attr('height', bounding_box.height +4);
            
                    data_information_group.select('.datacircle')
                        .attr('cx', xScale(dataset))
                    .attr('cy', 0); 
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
                    var inBetweenObjects = (object2 - object1)/2;
                    if(value < new Date(object1.getTime() + inBetweenObjects)) return object1;
                        else return object2;
                } 
            }         
            
            updateData = function() {
                rearrangeData();
                mapData();
                scales();
                updateAxes();
                updateBrush();
            };
            
            updateWidth = function() {
                updateSvg();
                scales();
                updateAxes();
                updateBrush(); 
            };
            
            updateHeight = function() {
                updateSvg();           
                scales();
                updateAxes();
                updateBrush();
            };

            svg();
            rearrangeData();
            mapData();
            scales();
            initBrush();
            axes();
            initDataInformation();
            
        });
    };
    
    chart.setData = function(value) {
    	if (!arguments.length) return data;
    	data = value;
    	if (typeof updateData === 'function') updateData();
    	return chart;
    };
    
    chart.setWidth = function(value) {
    	if (!arguments.length) return width;
    	width = value;
        padding = {'top': height/18, 'right': 10, 'bottom': height/18, 'left': 10};
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
    };
    
    chart.setHeight = function(value) {
    	if (!arguments.length) return height;
    	height = value;
        padding = {'top': height/18, 'right': 10, 'bottom': height/18, 'left': 10};
    	if (typeof updateHeight === 'function') updateHeight();
    	return chart;
    };
    
    chart.setOnChildBrushed = function(value){
        onChildBrushed = value;
        return chart;
    };
    
    chart.getDomain = function(){
        return domain;
    };
      
    chart.moveDataInformation = function(value){
        if (typeof moveDataInformation === 'function')
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
            
    return chart;    
}