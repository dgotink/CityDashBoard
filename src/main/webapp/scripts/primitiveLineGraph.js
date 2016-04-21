function primitiveLineGraph(){
    //variables
    var width = 800;
    var height = 100;
    var margin = 10;
    var padding = {'top': 10, 'right': 100, 'bottom': 10, 'left': 40};
    var data = {};
    var updateData;
    
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
            var line;
            //svg var
            var svg;
            var element = this;
            //text var
            var text;
            var background;
            //timeformat var
            var timeFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
            //button size vars
            var edge = 20;
            
            //makes and appends the svg to the element and adds buttons 
            function initialize(){
                //make the svg
                svg = d3.select(element)
                    .append("svg")
                    .attr("width", width + padding.left + padding.right)
                    .attr("height", height + padding.top + padding.bottom)
                    .attr("class", "svgbox");
            
                //the eye pattern (image) for the rect button
                svg.append("defs")
                    .append("pattern")
                    .attr("id", "eye")
                    .attr("width", 128)
                    .attr("height", 128)
                    .append("image")
                    .attr("xlink:href", 'resources/eye-icon.png')
                    .attr("width", edge)
                    .attr("height", edge);
            
                //append the button to add to the big graphbox
                svg.append("rect")
                    .data([data])
                    .attr("width", edge)
                    .attr("height", edge)
                    .attr("x", width + padding.left + padding.right- margin - edge)
                    .attr("y", padding.top + margin)
                    .style("fill", "url(#eye)")
                    .style('stroke', 'black')
                    .style('stroke-width', '1px')
                    .on('click', function(d) { swap(d); });	
            }
            
            function mapData(){
                mapX = data.data.map(function(d) { return timeFormat.parse(d.x); });
                mapY = data.data.map(function(d) { return d.y; });
            }
            
            function text(){
                text = svg.append('text')
                        .attr('x', margin)
                        .attr('y', 20)
                        .text( function () { return data.name ; })
                        .style("font-family", "sans-serif")
                        .style("font-size", "20px")
                        .style("fill", "black");
                
                var bbox = text.node().getBBox();
                
                background = svg.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', bbox.width + margin)
                        .attr('height', bbox.height + margin/2)
                        .style("fill", "white")
                        .style('opacity', '0.5');
            }
            
            function scales(){
                xScale = d3.time.scale()
                    .domain(d3.extent(mapX))
                    .range([margin + padding.left , margin + padding.left + width]);
            
                yScale = d3.scale.linear()
                    .domain(d3.extent(mapY))
                    .range([height - margin, margin]);
            
                line = d3.svg.line().interpolate("cardinal")
                    .x(function(d){ return xScale(timeFormat.parse(d.x)); })
                    .y(function(d){ return yScale(d.y); });  
            }
            
            function draw(){
                var container = svg.selectAll('g.line')
                    .data([data]);
            
                container.enter().append('g')
                    .style('stroke', function(d) { return d.color; })
                    .attr('class', function(d) { return 'line ' + d.name; });
            
                container.selectAll('path')
                    .data(function(d) { return [d.data]; }) 
                    .enter().append('path')
                    .attr('d', line);
            }
            
            updateData = function(){
                mapData();
                scales();
                draw(); 
                text();
            };

            initialize();
            mapData();
            scales();
            draw();
            text();
            
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