function controller(data) {   
    //data map vars and length
    var map_color = {};
    var map_theme = {};
    var map_data = {};
    var map_graph = {};
    var map_selected = {};
    //packery and their divs
    var packery_main;
    var packery_grid;
    var div_main;
    var div_grid;   
    //height and width var
    var width = window.innerWidth;
    var height = window.innerHeight;
    //this array contains the values to which you multiply the height to get the total height for all the selected linegraphs
    //this array has a size the same as half the amount of graphs drawn +1 (for 0)
    //the index is the amount of selected graphs
    var selected_heights = [0, 0.4, 0.55, 0.67, 0.76, 0.76, 0.76];
    //context vars
    var context_div;
    var context_graph;
    var context_height = 50;
    
    //init
    function init(){
        mapData();
        initPackery();
        createBaseLineGraphs();
    }
    
    //intitializes the packery elements (do at startup)
    function initPackery(){
        //create the div_main
        div_main = document.createElement('div');
        div_main.setAttribute('class', 'main');
        document.body.appendChild(div_main);
        //create the packery_main
        packery_main = new Packery(div_main, {
            //options
            gutter: 0,
            columnWidth : width,
            itemSelector: '.main-item'
        });
        //create the div_grid
        div_grid = document.createElement('div');
        div_grid.setAttribute('class', 'grid main-item');
        div_main.appendChild(div_grid);
        packery_main.appended(div_grid);
        //create the packery_grid
        packery_grid = new Packery(div_grid, {
            //options
            gutter: 0,
            columnWidth : width,
            itemSelector: '.grid-item'
        });
        //create the context linegraph div
        context_div = document.createElement('div')
        context_div.setAttribute('class', 'contextgraph main-item');
        div_main.appendChild(context_div);
        //create the context linegraph
        context_graph = linegraph_context()
                .setData(map_data)
                .setWidth(width)
                .setHeight(context_height)
                .setOnChildBrushed(onBrushedContext);                
        d3.select(context_div).call(context_graph);
        //append the context div to the packery_main and call for a layout
        packery_main.appended(context_div);
        packery_main.layout();
    }
    
    //maps the data in different dictionaries/maps (do at startup or data changes)
    function mapData(){
        //for every dataset in the data
        //map the color, theme and data
        data.forEach(function(dataset){
            map_color[dataset.name] = dataset.color;
            map_theme[dataset.name] = dataset.theme;
            map_data[dataset.name] = dataset.data;
        });
    }
    
    //returns list of names according to theme
    function findNamesByTheme(theme){
        var output = [];
        for(var key in map_theme){
            if(map_theme[key] === theme)
                output.push(key);
        }
        return output;
    }
    
    //returns integer of amount of selected graphs
    function findAmountSelected() {
        var amount_selected = 0;
        for (var key in map_graph) {
            if(map_selected[key])
                amount_selected++;
        }
        return amount_selected;
    }

    //for every dataset with theme base create a baselinegraph
    function createBaseLineGraphs(){
        //get the names of the base datasets
        var names = findNamesByTheme('base');
        //foreach name
        names.forEach(function(name){
            //create a div and append it to div_grid and packery_grid
            var element = document.createElement('div');
            element.setAttribute('id', name);
            element.setAttribute('class', 'grid-item base');
            div_grid.appendChild(element);
            packery_grid.appended(element);
            //make the grid item draggable    
            var draggie = new Draggabilly(element);
            packery_grid.bindDraggabillyEvents(draggie);
            //make the graph and add it to the map_graph    
            map_graph[name] = linegraph_base()
                .setName(name)
                .setColor(map_color[name])
                .setDomain(context_graph.getDomain())
                .setData(map_data[name])
                .setWidth(width)
                .setHeight(height)
                .setOnClick(onClickBaseLineGraph)
                .setOnMouseEnter(onMouseEnterLineGraph)
                .setOnMouseMove(onMouseMoveLineGraph)
                .setOnMouseLeave(onMouseLeaveLineGraph);
            d3.select(element)
                .call(map_graph[name]);
            //make the selected boolean and add it to the map_selected    
            map_selected[name] = false;           
        });
        updateHeight();
        //call for another packery_main layout as the size has changed
        packery_main.layout();
    }
    
    //for every dataset with parem theme create a linegraph
    function createLineGraphsWithTheme(theme){
        //get the names of the base datasets
        var names = findNamesByTheme(theme);
        //foreach name
        names.forEach(function(name){
            //create a div and append it to div_grid and packery_grid
            var element = document.createElement('div');
            element.setAttribute('id', name);
            element.setAttribute('class', 'grid-item ' + theme);
            div_grid.appendChild(element);
            packery_grid.appended(element);
            //make the grid item draggable    
            var draggie = new Draggabilly(element);
            packery_grid.bindDraggabillyEvents(draggie);
            //make the graph and add it to the map_graph    
            map_graph[name] = linegraph_base()
                .setName(name)
                .setColor(map_color[name])
                .setDomain(context_graph.getDomain())
                .setData(map_data[name])
                .setWidth(width)
                .setHeight(height) 
                .setOnClick(onClickLineGraph)
                .setOnMouseEnter(onMouseEnterLineGraph)
                .setOnMouseMove(onMouseMoveLineGraph)
                .setOnMouseLeave(onMouseLeaveLineGraph);
            d3.select(element)
                .call(map_graph[name]);
            //make the selected boolean and add it to the map_selected    
            map_selected[name] = false;           
        });
        updateHeight();
    }
    
    //remove existing graphs with param theme
    function removeLineGraphsWithTheme(theme){
        //find all the div elements in div_grid with class theme and remove them (also from the packery!)
        var elements = div_grid.getElementsByClassName(theme);
        for (var i = elements.length-1; i >=0; i--) {
            packery_grid.remove(elements[i]);
            div_grid.removeChild(elements[i]);
        }
        //remove the graphs from the map_graphs
        elements = findNamesByTheme(theme);
        elements.forEach(function(element){
            delete map_graph[element];
        }); 
        updateHeight();
    }
    
    //updates the width for every graph in map_graph
    function updateWidth() {
        for (var key in map_graph) {
            map_graph[key].setWidth(width);
        }  
        context_graph.width(width);
    }
    
    //updates the height for every graph in map_graph
    function updateHeight() {
        //get the amount of selected graphs
        var amount_selected = findAmountSelected();
        //determine the amount of space allocated to selected- and unselected graphs
        var total_selected_height = (height - context_height) * selected_heights[amount_selected];
        var total_unselected_height = (height - context_height) - total_selected_height;
        //for every graph in map_graph
        for (var key in map_graph) {
            //determine the new height
            var new_height;
            if(map_selected[key])
                new_height = total_selected_height/amount_selected;
            else 
                new_height = total_unselected_height/(Object.keys(map_graph).length - amount_selected);
            //give the graph the command to update his height
            map_graph[key].setHeight(new_height);
        } 
        //re-layout the packery module (since the sizes of the items have changed)
        packery_grid.layout();
    }
    
    //the on click event for the base linegraphs
    var onClickBaseLineGraph = function(name){
        if(map_selected[name]){
            map_selected[name] = false;
            removeLineGraphsWithTheme(name); 
        } else {
            map_selected[name] = true;
            createLineGraphsWithTheme(name); 
        }
    }; 
    
    //the on click event for the normal linegraphs
    var onClickLineGraph = function(name){
         if(map_selected[name]){
            map_selected[name] = false;
        } else {
            map_selected[name] = true;
        }
        updateHeight();
    };
    
    var onMouseEnterLineGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].showIndicator();
            map_graph[key].showDataInformation();
        } 
    };
    
    var onMouseMoveLineGraph = function(position){
        for (var key in map_graph) {            
            map_graph[key].moveIndicator(position);
            map_graph[key].moveDataInformation(position);
        } 
        
    };
    
    var onMouseLeaveLineGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].hideIndicator();
            map_graph[key].hideDataInformation();
        } 
    };
    
    //the on brushed event for the context linegraph
    var onBrushedContext = function (domain) {
        for (var key in map_graph) {            
            map_graph[key].setDomain(domain);
        } 
    };
    
    init();
    
}