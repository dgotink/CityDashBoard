function graph_buttonbar(keys){
    //variables
    var width;
    var height;
    var padding = {'top': 5, 'right': 120, 'bottom': 5, 'left': 40};
    
    var updateWidth;
    var updateHeight;
    
    var button_padding = 5;
    var button_size = height - button_padding - button_padding;
    
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
                    .style('fill', '#EEEEEE')
                    .style('stroke', 'black')
                    .style('stroke-width', 1.5);
            }
            
            function updateSvg(){
                svg
                    .attr('width', width)
                    .attr('height', height);
            
                svg.select('.background')
                    .attr("width", width)
                    .attr("height", height);       
            }
            
            function buttons(){
                button_group = svg.append('g')
                    .attr('class', 'buttongroup');
            
                button_keys.forEach(function(key, i){
                    button_dictionary[key] = button_group.append('rect')
                        .attr('id', key)
                        .attr('class', 'button')
                        .attr('x', padding.left + (i * (button_size + button_padding)))
                        .attr('y', button_padding)
                        .attr('width', button_size)
                        .attr('height', button_size)
                        .attr('fill', 'black')
                        .on('click', onClick);
                });               
            }
            
            function onClick(){
                var key = this.id;
                if(button_pressed[key])
                    button_pressed[key] = false;
                else
                    button_pressed[key] = true;
                on_click(key);
            }
            
            initSvg();
            buttons();
            
            updateWidth = function(){
                updateSvg();
            };
            
            updateHeight = function(){
                updateSvg();              
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
        button_size = height - button_padding - button_padding;
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