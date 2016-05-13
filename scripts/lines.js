function lines(data) {
    var internal_counter;
    var graphs = {};
    var length = Object.keys(graphs).length;
    var clicked = {};
    var context;
    
    var width = calculateWidth();
    var contextHeight = 50;
    var height = calculateHeight();
    //this array contains the values to which you multiply the height to get the total height for all the selected linegraphs
    //this array has a size the same as half the amount of graphs drawn +1 (for 0)
    //the index is the amount of selected graphs
    var selected_heights = [0, 0.4, 0.55, 0.67, 0.76, 0.76, 0.76];
    
    var packery_main;
    var packery_linegraphs; 
    
    var main_div;
    var grid_div;
       
    window.addEventListener("resize", function() {
        width = calculateWidth();
        updateWidth();
        height = calculateHeight();
        updateHeight();
    });
    
    function calculateHeight() {
        return window.innerHeight - contextHeight;
    }
    
    function calculateWidth() {
        return window.innerWidth;
    }   
    
    var onSizeChangedCallback = function(){
       internal_counter++;
        if(internal_counter === length)
            packery_linegraphs.layout();       
    };
    
    var onChildClick = function (name) {
        averageClicked(name);
        if(clicked[name])
            clicked[name] = false;
        else 
            if(getAmountClicked() < (selected_heights.length-1))
                clicked[name] = true;    
        updateHeight();       
    };
    
    function averageClicked(name){
        if(clicked[name]){
            //remove
        }
        else {
            data.forEach(function(datum) { 
                if(datum.name === name){
                    datum.source.forEach(function(src){
                        var element = document.createElement('div');
                        element.setAttribute('class', 'linegraph grid-item ' + name);
                        grid_div.appendChild(element);
                        packery_linegraphs.appended(element);
                
                        var draggie = new Draggabilly( element );
                        packery_linegraphs.bindDraggabillyEvents( draggie );
                
                        graphs[src.name] = linegraph()
                            .data(src)
                            .width(width)
                            .height(height)
                            .onChildClick(onChildClick)
                            .onChildEnter(onChildEnter)
                            .onChildLeave(onChildLeave)
                            .onChildMove(onChildMove)
                            .onSizeChangedCallback(onSizeChangedCallback);
                
                        d3.select(element)
                            .call(graphs[src.name]);
                
                        clicked[src.name] = false;        
                    });                      
                }             
            }); 
        }
        
    }
    
    var onChildEnter = function () {
        d3.selectAll('.data_information')
                .style('visibility', 'visible');
        d3.selectAll('.mouse_indicator')
            .style('visibility', 'visible');
    };
    
    var onChildLeave = function () {
        d3.selectAll('.data_information')
                .style('visibility', 'hidden');
        d3.selectAll('.mouse_indicator')
            .style('visibility', 'hidden');
    };
    
    var onChildMove = function (position) {
        d3.selectAll('.mouse_indicator')
                .attr('x', position);
        
        for (var name in graphs) {           
            graphs[name].showDataInformation(position);
        } 
    };
    
    var onChildBrushed = function (domain) {
        for (var name in graphs) {            
            graphs[name].updateDomain(domain);
        } 
    };
    
    function getAmountClicked() {
        var amount_clicked = 0;
        for (var value in clicked) {
            if(clicked[value])
                amount_clicked++;
        }
        return amount_clicked;
    }
    
    function updateWidth() {
        for (var name in graphs) {
            graphs[name].width(width);
        }  
        context.width(width);
    }
    
    function updateHeight() {
        internal_counter = 0;
        var amount_clicked = getAmountClicked();
        var total_selected_height = height * selected_heights[amount_clicked];
        var total_unselected_height = height - total_selected_height;
        for (var name in graphs) {
            var tmp_height;
            if(clicked[name])
                tmp_height = total_selected_height/amount_clicked;
            else 
                tmp_height = total_unselected_height/(length - amount_clicked);
            graphs[name].height(tmp_height);
        } 
        packery_linegraphs.layout();
    }
    
    function init() {
        main_div = document.createElement('div');
        main_div.setAttribute('class', 'main');
        document.body.appendChild(main_div);
        //make the div that will contain all the linedivs
        grid_div = document.createElement('div');
        grid_div.setAttribute('class', 'lines grid main-item');
        main_div.appendChild(grid_div);
        
        packery_main = new Packery( main_div, {
            // options
            gutter: 0,
            columnWidth: window.innerWidth,
            itemSelector: '.main-item'
        });
        
        packery_linegraphs = new Packery( grid_div, {
            // options
            gutter: 0,
            columnWidth: window.innerWidth,
            itemSelector: '.grid-item'
        });
        
        packery_main.appended(packery_linegraphs);      
        
        data.forEach(function(datum) { 
            var element = document.createElement('div');
                element.setAttribute('class', 'linegraph grid-item');
                grid_div.appendChild(element);
                packery_linegraphs.appended(element);
                
                var draggie = new Draggabilly( element );
                packery_linegraphs.bindDraggabillyEvents( draggie );
                
                graphs[datum.name] = linegraph_average().data(datum)
                        .width(width)
                        .height(height)
                        .onChildClick(onChildClick)
                        .onChildEnter(onChildEnter)
                        .onChildLeave(onChildLeave)
                        .onChildMove(onChildMove)
                        .onSizeChangedCallback(onSizeChangedCallback);
                
                d3.select(element)
                    .call(graphs[datum.name]);
                
                clicked[datum.name] = false;           
        });
        
        var element = document.createElement('div')
        element.setAttribute('class', 'contextgraph main-item');
        main_div.appendChild(element);
        packery_main.appended(element);
        
        context = contextgraph().data(data)
                .width(width)
                .height(contextHeight)
                .onChildBrushed(onChildBrushed);
                
        d3.select(element).call(context);
        
        updateHeight();
        packery_main.layout();
    }
    
    init();
}