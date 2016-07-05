function header(){
    
    var height;
    var updateHeight;
    
    var width;
    var updateWidth;
    
    var text;
    var updateText;
    
    var color;
    var updateColor;
    
    var color_background;
    var updateBackgroundColor;
    
    var element;

    //the function that makes the graph
    function chart(selection){
        selection.each(function() {
            
            var svg;
            var background;
            var text_group;
            
            element = this;
            
            function initSvg(){
                //make the svg
                svg = d3.select(element)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'svgbox')
                    .style('display', 'block');
            
                background = svg.append('rect')
                    .attr('class', 'background')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', width)
                    .attr('height', height);
            }
            
            function updateSvg(){
                svg
                    //.transition().duration(1000)
                    .attr('width', width)
                    .attr('height', height);
            
                background
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', color_background);
            }
            
            function initText(){
                text_group = svg.append('g')
                        .attr('class', 'text-group');
                
                text_group.append('text')
                    .attr('class', 'text')
                    .attr('text-anchor', 'end'); 
            }
            
            updateText = function(){
                var fontsize = 16;
                
                text_group.select('.text')
                    .text(text.toUpperCase())
                    .attr('x', width - 10)
                    .attr('y', 10 + fontsize)
                    .style('font-size', fontsize)
                    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif;')
                    .style('fill', 'color');
            };
            
            updateHeight = function(){
               updateSvg();
               updateText();
            };
            
            updateWidth = function(){
               updateSvg();
               updateText();
            };
            
            updateColor = function(){
               updateText();
            };
            
            updateBackgroundColor = function(){
                background
                    .style('fill', color_background);
            };
            
            function init(){
                initSvg();
                initText();
            }
            
            init();
        });
    }
    
    chart.setHeight = function(value){
        height = value;
        if (typeof updateHeight === 'function') updateHeight();
        return chart;
    };
    
    chart.getHeight = function(){
        return height;
    };
    
    chart.setWidth = function(value){
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
    };
    
    chart.setText = function(value){
        text = value;
        if (typeof updateText === 'function') updateText();
        return chart;
    };
    
    chart.setColor = function(value){
        color = value;
        if (typeof updateColor === 'function') updateColor();
        return chart;
    };
    
    chart.setBackgroundColor = function(value){
        color_background = value;
        if (typeof updateBackgroundColor === 'function') updateBackgroundColor();
        return chart;
    };  
    
    chart.getElement = function(){
        return element;
    };
    
    return chart;
}
    
           