function graph_buttonbar(keys){
    //variables
    var width;
    var height;
    var padding = {'top': 5, 'right': 120, 'bottom': 5, 'left': 40};
    
    var updateWidth;
    var updateHeight;
    
    var button_padding = 5;
    
    var button_keys = keys;
    var button_pressed = {};
    
    button_keys.forEach(function(key){
        button_pressed[key] = false;
    });
    
    var on_click;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //svg var
            var svg;
            var element = this;
            //buttongroup var
            var button_group;
            var button_dictionary = {};
            
            function initSvg(){
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
                    .style('fill', '#27252D')
                    .style('stroke', 'black')
                    .style('stroke-width', 1.5);
            }
            
            function updateSvg(){
                svg
                    .attr('width', width)
                    .attr('height', height);
            
                svg.select('.background')
                    .attr('width', width)
                    .attr('height', height);       
            }
            
            function initButtons(){
                button_group = svg.append('g')
                    .attr('class', 'buttongroup');
            
                button_keys.forEach(function(key){
                    var group = button_group.append('g')
                        .attr('class', 'button')
                        .attr('id', key)
                        .on('click', onClick);
                
                    group.append('rect')
                        .attr('class', 'buttonbackground')
                        .style('fill', '#4A4755')
                        .style('opacity', '1');
                
                    group.append('text')
                        .attr('class', 'buttontext')
                        .attr('pointer-events', 'none')
                        .text(key)
                        .style('font-size', 16)
                        .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif;')
                        .style('fill', 'white');
                
                    button_dictionary[key] = group;
                });
                updateButtons();
            }
            
            function updateButtons() { 
                var fontsize = 16;
                var last_x = padding.left;
                for(var key in button_dictionary){
                    var group = button_dictionary[key];
                    var buttonbox = group.select('.buttonbackground');
                    var buttontext = group.select('.buttontext');
                    
                    buttontext
                        .attr('x', last_x + 5 + 5)
                        .attr('y', ((height - padding.top - padding.bottom)/2) + fontsize/2)
                        .style('font-size', fontsize);
                
                    var bbox = buttontext.node().getBBox();
                    last_x = bbox.x + bbox.width + 5;
                    
                    buttonbox
                            .attr('x', bbox.x - 5)
                            .attr('y', padding.top)
                            .attr('width', bbox.width + 10)
                            .attr('height', height - padding.top - padding.bottom)
                            .style('visibility', 'visible');
                }           
            };
            
            function onClick(){
                var key = this.id;
                if(button_pressed[key])
                    button_pressed[key] = false;
                else
                    button_pressed[key] = true;
                on_click(key);
            }
            
            initSvg();
            initButtons();
            
            updateWidth = function(){
                updateSvg();
            };
            
            updateHeight = function(){
                updateSvg();  
                updateButtons();
            }; 
        });
    };
    
    chart.setWidth = function(value) {
    	if (!arguments.length) return width;
    	width = value;
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
    };
    
    chart.setHeight = function(value) {
    	if (!arguments.length) return height;
    	height = value;
    	if (typeof updateHeight === 'function') updateHeight();
    	return chart;
    };
    
    chart.setOnClick = function(value){
        on_click = value;
        return chart;
    };
    
    chart.getButtonPressedDictionary = function(){
        return button_pressed;
    };
    
    return chart;    
}