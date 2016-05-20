function controller(data, cities) {   
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
    //buttongroup vars
    var buttonbar_div;
    var buttonbar_graph;
    var buttonbar_height = 50;
    var button_keys = ['SWAP_LINES', 'SORT_BY_CITY', 'SORT_BY_THEME'];
    //just for the sake of simplicity keep a height - contextheight
    var grid_height = height - context_height - buttonbar_height;
    
    //init
    function init(){
        mapData();
        initPackery();
        createBaseGraphs();
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
        //create the buttonbar
        buttonbar_div = document.createElement('div');
        buttonbar_div.setAttribute('class', 'buttonbar main-item');        
        buttonbar_graph = graph_buttonbar(button_keys)
                .setWidth(width)
                .setHeight(buttonbar_height)
                .setOnClick(onClickButtonBar);
        d3.select(buttonbar_div).call(buttonbar_graph);       
        div_main.appendChild(buttonbar_div);
        packery_main.appended(buttonbar_div);   
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
        //create the context graph div
        context_div = document.createElement('div');
        context_div.setAttribute('class', 'contextgraph main-item');
        div_main.appendChild(context_div);
        //create the context graph
        context_graph = graph_context()
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

    //for every dataset with theme base create a basegraph
    function createBaseGraphs(){
        //get the names of the base datasets
        var names = findNamesByTheme('base');
        //foreach name
        names.forEach(function(name){
            //create a div and append it to div_grid and packery_grid
            var element = document.createElement('div');
            element.setAttribute('id', name);
            element.setAttribute('class', 'grid-item base-' + name);
            div_grid.appendChild(element);
            packery_grid.appended(element);
            //make the grid item draggable    
            var draggie = new Draggabilly(element);
            packery_grid.bindDraggabillyEvents(draggie);
            //make the graph and add it to the map_graph    
            map_graph[name] = graph_base()
                .setName(name)
                .setColor(map_color[name])
                .setDomain(context_graph.getDomain())
                .setData(map_data[name])
                .setWidth(width)
                .setHeight(1)
                .setOnClick(onClickGraph)
                .setOnMouseEnter(onMouseEnterGraph)
                .setOnMouseMove(onMouseMoveGraph)
                .setOnMouseLeave(onMouseLeaveGraph)
                .setOnButtonClick(onButtonClickGraphBase);
            d3.select(element)
                .call(map_graph[name]);
            //make the selected boolean and add it to the map_selected    
            map_selected[name] = false;           
        });
        updateHeight();
        //call for another packery_main layout as the size has changed
        packery_main.layout();
    }
    
    //for every dataset with parem theme create a graph
    function createGraphsWithTheme(theme){
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
            var test = buttonbar_graph.getButtonPressedDictionary()['SWAP_LINES'];
            //make the graph and add it to the map_graph    
            map_graph[name] = graph()
                .setName(name)
                .setColor(map_color[name])
                .setDomain(context_graph.getDomain())
                .setData(map_data[name])
                .setWidth(width)
                .setHeight(1) 
                .setOnClick(onClickGraph)
                .setOnMouseEnter(onMouseEnterGraph)
                .setOnMouseMove(onMouseMoveGraph)
                .setOnMouseLeave(onMouseLeaveGraph)
                .setTrendFocus(buttonbar_graph.getButtonPressedDictionary()['SWAP_LINES']);
            d3.select(element)
                .call(map_graph[name]);
            //make the selected boolean and add it to the map_selected    
            map_selected[name] = false;           
        });
        //set the item order so the linegraphs appear under the acording base graph
        var items = packery_grid.items;
        var index = -1;
        for(var i = 0; i < items.length; i++){
            var element = items[i].element;
            if (element.classList.contains('base-' + theme))
                index = i;  
            if (element.classList.contains(theme)){
                if(index >= 0){
                    var item = items.splice(i, 1);
                    items.splice(index+1, 0, item[0]);
                }
            }           
        }
        updateHeight();
    }
    
    //remove existing graphs with param theme
    function removeGraphsWithTheme(theme){
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
        var total_selected_height = grid_height * selected_heights[amount_selected];
        var total_unselected_height = grid_height - total_selected_height;
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
    
    //the on click event for the base graphs
    var onButtonClickGraphBase = function(name, create){
        if(!create){
            removeGraphsWithTheme(name); 
        } else {
            createGraphsWithTheme(name); 
        }
    }; 
    
    //the on click event for the normal graphs
    var onClickGraph = function(name){
         if(map_selected[name]){
            map_selected[name] = false;
        } else {
            map_selected[name] = true;
        }
        updateHeight();
    };
    
    var onMouseEnterGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].showIndicator();
            map_graph[key].showDataInformation();
        } 
    };
    
    var onMouseMoveGraph = function(position){
        for (var key in map_graph) {            
            map_graph[key].moveIndicator(position);
            map_graph[key].moveDataInformation(position);
        } 
        
    };
    
    var onMouseLeaveGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].hideIndicator();
            map_graph[key].hideDataInformation();
        } 
    };
    
    var onBrushedContext = function (domain) {
        for (var key in map_graph) {            
            map_graph[key].setDomain(domain);
        } 
    };
    
    var onClickButtonBar = function(name){
        if(name === 'SWAP_LINES') {
            for(var key in map_graph) {
                map_graph[key].swapLines();
            }
        } else if(name === 'SORT_BY_CITY'){
            sortByCity();
        } else if(name === 'SORT_BY_THEME'){
            sortByTheme();
        }           
    };
    
    function sortByCity(){
        var order = [];
        for(var key in map_graph){
            if(map_theme[key] === 'base')
                order.push(map_graph[key].getElement());
        }
        cities.forEach(function(city){
            for(var key in map_graph){
                if(key.indexOf(city) > 0)
                    order.push(map_graph[key].getElement());
            }
        });
        packery_grid.items.forEach(function(o, index){
            o.element = order[index];
        }) ;
        packery_grid.layout();
    }
    
    function sortByTheme(){
       var order = [];
        for(var key in map_graph){
            if(map_theme[key] === 'base')
                order.push(map_graph[key].getElement());
                for(var name in map_graph){
                    if(map_theme[name] === key)
                        order.push(map_graph[name].getElement());
                }
        }
        packery_grid.items.forEach(function(o, index){
            o.element = order[index];
        }) ;
        packery_grid.layout(); 
    }
    
    init();
    
}