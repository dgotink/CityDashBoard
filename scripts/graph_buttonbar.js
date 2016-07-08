function graph_buttonbar(keys){
    //variables
    var width;
    var height;
    var padding = {'top': 5, 'right': 10, 'bottom': 5, 'left': 10};
    
    var updateWidth;
    var updateHeight;
    
    var button_padding = 5;
    
    var button_keys = keys;
    var button_pressed = {};
    
    var max_selected;
    var changeTriangleText;
    var flashRed;
    
    button_keys.forEach(function(key){
        button_pressed[key] = false;
    });
    
    var on_click;
    var on_help_click;

    //the function that makes the linegraph
    function chart(selection){
        selection.each(function() { 
            //svg var
            var svg;
            var element = this;
            //buttongroup var
            var button_group;
            var button_dictionary = {};
            //triangles
            var triangle_top;
            var triangle_bottom;
            var trianglegroup;
            var triangletext;
            var trianglerect;
            //help
            var help_group;
            
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
            
            function initTriangles(){
                var triangle_up = d3.svg.symbol().type('triangle-up')
                    .size(50);
                                
                var triangle_down = d3.svg.symbol().type('triangle-down')
                    .size(50);
            
                trianglegroup = svg.append('g')
                    .attr('class', 'trianglegroup');
            
                trianglerect = trianglegroup.append('rect')
                        .attr('class', 'background')
                        .attr('x', padding.left)
                        .attr('y', padding.top)
                        .attr('width', 65)
                        .attr('height', 40)
                        .style('fill', 'none');
                                
                triangle_top = trianglegroup.append('g')
                    .attr('class', 'triangletop')
                    .append('path')
                        .attr('class', 'trianglePath')
                        .attr('d',triangle_down)
                        .attr('fill', 'white');
                
                triangle_bottom = trianglegroup.append('g')
                    .attr('class', 'trianglebottom')
                    .append('path')
                        .attr('class', 'trianglePath')
                        .attr('d',triangle_up)
                        .attr('fill', 'white');
                
                var bbox = triangle_top.node().getBBox();
                        
                triangle_top
                    .attr('transform', 'translate(' + (padding.left + 10) + ',' + (padding.top + 6 + bbox.height/2) + ')');

                bbox = triangle_bottom.node().getBBox();
                
                triangle_bottom
                    .attr('transform', 'translate(' + (padding.left + 10) + ',' + ((height-padding.bottom) - 6 - bbox.height/2) + ')');
            
                triangletext = trianglegroup.append('text')
                    .attr('class', 'triangletext')
                    .style('font-size', 16)
                    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif;')
                    .style('fill', 'white')
                    .attr('x', padding.left + 30)
                    .attr('y', padding.top + 16 + 10)
                    .text('0/' + max_selected);
            }
            
            changeTriangleText = function(amount){
                triangletext
                    .text(amount + '/' + max_selected);
            };
            
            flashRed = function(){
                trianglerect
                        .style('fill', 'red')
                        .transition().delay(500).duration(1000)
                        .style('fill', '#27252D');
            };
            
            function initHelp(){
                help_group = svg.append('g')
                    .attr('class', 'helpgroup');
                
                help_group.append('circle')
                    .attr('cx', width - padding.right - 50)
                    .attr('cy', 25)
                    .attr('r', 18)
                    .style('fill', '#4A4755')
                    .on('click', helpclicked);
                
                help_group.append('text')
                    .attr('pointer-events', 'none')
                    .attr('x', width - padding.right - 50 - 7.5)
                    .attr('y', 25 + 7)
                    .style('fill', 'white')
                    .style('font-size', 24)
                    .style('font-weight', 'bold')
                    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif;')
                    .style('font', 'white')
                    .text('?');
            }
            
            function helpclicked(){
                on_help_click();
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
                var last_x = 100;
                for(var key in button_dictionary){
                    var group = button_dictionary[key];
                    var buttonbox = group.select('.buttonbackground');
                    var buttontext = group.select('.buttontext');
                    
                    buttontext
                        .attr('x', last_x + 5 + 5)
                        .attr('y', padding.top + 16 + 10)
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
            initTriangles();
            initHelp();
            
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
    
    chart.setMaxSelected = function(value){
        max_selected = value;
        return chart;
    }
    
    chart.updateTriangleText = function(value){
        if (typeof changeTriangleText === 'function') changeTriangleText(value);
        return chart;  
    };
    
    chart.flashRed = function(){
        if (typeof flashRed === 'function') flashRed();
        return chart;
    };
    
    chart.setOnHelpClick = function(value){
        on_help_click = value;
        return chart;
    };
    
    return chart;    
}