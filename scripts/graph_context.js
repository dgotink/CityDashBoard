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
    
    var domain;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //data vars
            var mapX;
            //scale vars
            var xScale;
            //axis var
            var axis_hour;
            var axis_day;
            var axis_label;
            //svg var
            var svg;
            var element = this;
            //brush var for choosing the focus
            var brush;
            //timeformat var
            var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%L%Z');

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
                    .style('fill', '#EEEEEE')
                    .style('stroke', 'black')
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
                            return formatter(d);
                        }
                        else
                            return null;
                       
                    });
            
                svg.append('g')
                    .attr('class', 'axis hours')
                    .call(axis_hour); 
            
                svg.append('g')
                    .attr('class', 'axis days')
                    .call(axis_day); 
            
                svg.append('g')
                    .attr('class', 'axis_label')
                    .call(axis_label); 
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
        padding = {'top': height/12, 'right': width/12, 'bottom': height/12, 'left': 40};
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
    };
    
    chart.setHeight = function(value) {
    	if (!arguments.length) return height;
    	height = value;
        padding = {'top': height/12, 'right': width/12, 'bottom': height/12, 'left': 40};
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
      
    return chart;    
}