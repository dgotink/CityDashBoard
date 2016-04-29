function linegraph(){
    //variables
    var width = 800;
    var height = 50;
    var padding = {'top': height/12, 'right': 100, 'bottom': height/12, 'left': 40};
    var data = {};
    
    var onChildClick;
    
    var updateData;
    var updateWidth;
    var updateHeight;
    
    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //data vars
            var mapX;
            var mapY;
            //scale vars
            var xScale;
            var yScale;
            //line function var
            var line_animation;
            var line;
            //svg var
            var svg;
            var element = this;
            //timeformat var
            var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
            
            //makes and appends the svg to the element and adds buttons 
            function initialize(){
                //make the svg
                svg = d3.select(element)
                    .append("svg")
                    .attr("width", width + padding.left + padding.right)
                    .attr("height", height)
                    .attr("class", "svgbox")
                    .on('click', onClick);     
            }
            
            function updateSvg(){
                svg
                    .transition().duration(1000)
                    .attr("width", width + padding.left + padding.right)
                    .attr("height", height);
            }
            
            function onClick(){
                onChildClick(data.name);
            }
            
            function mapData() {
                mapX = data.data.map(function(d) { return timeFormat.parse(d.x); });
                mapY = data.data.map(function(d) { return d.y; });
            }
                        
            function scales() {
                xScale = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([padding.left , padding.left + width]);
            
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - padding.bottom, padding.top]);
            
                line_animation = d3.svg.line().interpolate("cardinal")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return height - padding.bottom; });  
            
                line = d3.svg.line().interpolate("cardinal")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScale(d.y); });  
            }
            
            function redraw() {
                var container = svg.selectAll('g.line')
                    .data([data]);
            
                //update
                container.selectAll('path')
                    .data(function(d) { return [d.data]; })
                    .transition().duration(1000)
                    .attr('d', line);
            
                //enter
                container.enter().append('g')
                    .style('stroke', function(d) { return d.color; })
                    .attr('class', function(d) { return 'line ' + d.name; });
            
                container.selectAll('path')
                    .data(function(d) { return [d.data]; }) 
                    .enter().append('path')
                    .attr('d', line_animation)
                    .transition().duration(1000)
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
                mapData();
                scales();
                redraw(); 
            };

            initialize();
            mapData();
            scales();
            redraw();            
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
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
    };
    
    chart.height = function(value) {
    	if (!arguments.length) return height;
    	height = value;
        padding = {'top': height/12, 'right': 100, 'bottom': height/12, 'left': 40};
    	if (typeof updateHeight === 'function') updateHeight();
    	return chart;
    };
    
    chart.onChildClick = function(value) {
        onChildClick = value;
        return chart;
    };
    
    return chart;
}