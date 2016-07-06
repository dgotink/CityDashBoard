function controller(data) {   
    //data map vars and length
    var map_color = {};
    var map_theme = {};
    var map_city = {};
    var map_data = {};
    var map_graph = {};
    var map_headers = {};
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
    //key vars
    var button_keys = ['SWAP LINES', 'ORDER BY CITY', 'ORDER BY ATTRIBUTE'];
    //just for the sake of ease keep a height - contextheight
    var grid_height = height - context_height - buttonbar_height;
    //colorscheme
    var colorscheme = createColorScheme();
    //keeps the active headers
    var active_headers = [];
    
    //init
    function init(){
        mapData();
        initPackeryMain();
        initButtonBar();
        initPackeryGrid();
        initContextGraph();
        createGraphs();
        initHeaders();
    }
    
    function initButtonBar(){
        //create the buttonbar div
        buttonbar_div = document.createElement('div');
        buttonbar_div.setAttribute('class', 'buttonbar main-item'); 
        div_main.appendChild(buttonbar_div);
        //create the buttonbar graph
        buttonbar_graph = graph_buttonbar(button_keys)
                .setWidth(width)
                .setHeight(buttonbar_height)
                .setOnClick(onClickButtonBar);
        d3.select(buttonbar_div).call(buttonbar_graph);
        packery_main.appended(buttonbar_div);    
    }
    
    function initContextGraph(){
        //create the context graph div
        context_div = document.createElement('div');
        context_div.setAttribute('class', 'contextgraph main-item');
        div_main.appendChild(context_div);
        //create the context graph
        context_graph = graph_context()
                .setData(map_data)
                .setWidth(width)
                .setHeight(context_height)
                .setOnChildBrushed(onBrushedContext)
                .setOnMouseEnter(onMouseEnterGraph)
                .setOnMouseMove(onMouseMoveGraph)
                .setOnMouseLeave(onMouseLeaveGraph);
        d3.select(context_div).call(context_graph);
        packery_main.appended(context_div);
    }
    
    //intitializes the main packery (this one is used to layout the buttonbar, grid, and context
    function initPackeryMain(){
        //create the div_main
        div_main = document.createElement('div');
        div_main.setAttribute('class', 'main');
        document.body.appendChild(div_main);
        //create the packery_main
        packery_main = new Packery(div_main, {
            //options
            gutter: 0,
            itemSelector: '.main-item'
        });  
    }
    
    function initPackeryGrid(){
        //create the div_grid
        div_grid = document.createElement('div');
        div_grid.setAttribute('class', 'grid main-item');
        div_main.appendChild(div_grid);
        packery_main.appended(div_grid);
        //create the packery_grid
        packery_grid = new Packery(div_grid, {
            //options
            gutter: 0,
            itemSelector: '.grid-item'
        });
        packery_grid.on( 'dragItemPositioned', removeHeaders);
    }
    
    function initHeaders(){
        var headers = ['Antwerpen', 'Brussel', 'Leuven', 'temperature', 'pressure', 'humidity'];
        headers.forEach(function(head){
            var element = document.createElement('div');
            element.setAttribute('id', head);
            element.setAttribute('class', 'grid-item');
            
            map_headers[head] = header()
                .setWidth(width)
                .setHeight(30) 
                .setText(head);
            d3.select(element)
                .call(map_headers[head]);
        });  
    }
    
    //intitializes the main packery (this one is used to layout the buttonbar, grid, and context
    function initPackeryMain(){
        //create the div_main
        div_main = document.createElement('div');
        div_main.setAttribute('class', 'main');
        document.body.appendChild(div_main);
        //create the packery_main
        packery_main = new Packery(div_main, {
            //options
            gutter: 0,
            itemSelector: '.main-item'
        });  
    }
    
    function initPackeryGrid(){
        //create the div_grid
        div_grid = document.createElement('div');
        div_grid.setAttribute('class', 'grid main-item');
        div_main.appendChild(div_grid);
        packery_main.appended(div_grid);
        //create the packery_grid
        packery_grid = new Packery(div_grid, {
            //options
            gutter: 0,
            itemSelector: '.grid-item'
        });
    }

    //maps the data in different dictionaries/maps (do at startup or data changes)
    function mapData(){
        //for every dataset in the data
        //map the color, theme and data
        data.forEach(function(dataset){
            map_color[dataset.name] = dataset.color;
            map_theme[dataset.name] = dataset.theme;
            map_city[dataset.name] = dataset.city;
            map_data[dataset.name] = dataset.data;
        });
    }
    
    //returns list of names according to theme
    function findThemes(){
        var themes = [];
        for(var key in map_theme){
            if(themes.indexOf(map_theme[key]) < 0)
                themes.push(map_theme[key]);
        }
        return themes;
    }
    
    function findCities(){
        var cities = [];
        for(var key in map_city){
            if(cities.indexOf(map_city[key]) < 0)
                cities.push(map_city[key]);
        }
        return cities;
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
    
    //creates all the graphs and adds them to the modules
    function createGraphs(){
        //foreach dataset
        for(var key in map_data){
            var city = map_city[key];
            //create a div and append it to div_grid and packery_grid
            var element = document.createElement('div');
            element.setAttribute('id', key);
            element.setAttribute('class', 'grid-item');
            div_grid.appendChild(element);
            packery_grid.appended(element);
            //make the grid item draggable    
            var draggie = new Draggabilly(element);
            packery_grid.bindDraggabillyEvents(draggie);
            //make the graph and add it to the map_graph    
            map_graph[key] = graph()
                .setName(key)
                .setLabel(map_city[key] + ' ' + map_theme[key])
                .setColor(map_color[key])
                .setDomain(context_graph.getDomain())
                .setData(map_data[key])
                .setWidth(width)
                .setHeight(1) 
                .setOnClick(onClickGraph)
                .setOnMouseEnter(onMouseEnterGraph)
                .setOnMouseMove(onMouseMoveGraph)
                .setOnMouseLeave(onMouseLeaveGraph)
                .setTrendFocus(buttonbar_graph.getButtonPressedDictionary()['SWAP LINES']);
            d3.select(element)
                .call(map_graph[key]);
            //make the selected boolean and add it to the map_selected    
            map_selected[key] = false;           
        }
        updateHeight();
        packery_grid.layout();
        packery_main.layout();
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
        var offset = 0;
        active_headers.forEach(function(key){
            offset += map_headers[key].getHeight();
        });
        var height_after_offset = grid_height - offset;
        //get the amount of selected graphs
        var amount_selected = findAmountSelected();
        //determine the amount of space allocated to selected- and unselected graphs
        var total_selected_height = height_after_offset * selected_heights[amount_selected];
        var total_unselected_height = height_after_offset - total_selected_height;
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
            //call for a relayout
            packery_grid.layout();  
        } 
    }

    //the on click event for the normal graphs
    var onClickGraph = function(name){
        if(document.querySelector('.packery-drop-placeholder') === null){
            if(map_selected[name]){
                map_selected[name] = false;
            } else {
                map_selected[name] = true;
            }
            map_graph[name].setSelected(map_selected[name]);
            updateHeight();
        } else {
            if(active_headers.length > 0)
                removeHeaders();
        }
    };
    
    var onMouseEnterGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].showIndicator();
            map_graph[key].showDataInformation();
        } 
        context_graph.showDataInformation();
    };
    
    var onMouseMoveGraph = function(position){
        for (var key in map_graph) {            
            map_graph[key].moveIndicator(position);
            map_graph[key].moveDataInformation(position);
        } 
        context_graph.moveDataInformation(position);
    };
    
    var onMouseLeaveGraph = function(){
        for (var key in map_graph) {            
            map_graph[key].hideIndicator();
            map_graph[key].hideDataInformation();
        } 
        context_graph.hideDataInformation();
    };
    
    var onBrushedContext = function (domain) {
        for (var key in map_graph) {            
            map_graph[key].setDomain(domain);
        } 
    };
    
    var onClickButtonBar = function(name){
        if(name === 'SWAP LINES') {
            for(var key in map_graph) {
                map_graph[key].swapLines();
            }
        } else if(name === 'ORDER BY CITY'){
            sortByCity();
        } else if(name === 'ORDER BY ATTRIBUTE'){
            sortByTheme();
        }           
    };
    
    function sortByCity(){
        if(active_headers.length > 0)
            removeHeaders();
        var cities = findCities();
        var order = [];
        var tmp_active = [];

        cities.forEach(function(city){
            var tmp = map_headers[city].getElement();
            map_headers[city].setColor(colorscheme['forground'][city]);
            map_headers[city].setBackgroundColor(colorscheme['background'][city]);
            div_grid.appendChild(tmp);
            packery_grid.appended(tmp);
            order.push(tmp);
            tmp_active.push(city);
            for(var key in map_graph){
                if(map_city[key] === city){
                    order.push(map_graph[key].getElement());
                    map_graph[key].setBackgroundcolor(colorscheme['background'][city]);
                    var theme = map_theme[key];
                    map_graph[key].setColor(colorscheme['forground'][city]);
                }  
            }  
        });
        active_headers = tmp_active;
        updateHeight();
        packery_grid.items.forEach(function(o, index){
            o.element = order[index];
        }) ;
        packery_grid.layout();
    }
    
    function sortByTheme(){
        if(active_headers.length > 0)
            removeHeaders();
        var themes = findThemes();
        var order = [];
        var tmp_active = [];
        themes.forEach(function(theme){
            var tmp = map_headers[theme].getElement();
            map_headers[theme].setColor(colorscheme['forground'][theme]);
            map_headers[theme].setBackgroundColor(colorscheme['background'][theme]);
            div_grid.appendChild(tmp);
            packery_grid.appended(tmp);
            order.push(tmp);
            tmp_active.push(theme);
            for(var key in map_graph){
                if(map_theme[key] === theme){
                    order.push(map_graph[key].getElement());
                    map_graph[key].setBackgroundcolor(colorscheme['background'][theme]);
                    var city = map_city[key];
                    map_graph[key].setColor(colorscheme['forground'][theme]);
                }  
            }
        });
        active_headers = tmp_active;
        updateHeight();
        packery_grid.items.forEach(function(o, index){
            o.element = order[index];
        }) ;
        packery_grid.layout();
    }
    
    function removeHeaders(){
        active_headers.forEach(function(key){
            var tmp = map_headers[key].getElement();
            packery_grid.remove(tmp);
        });
        active_headers = [];
        updateHeight();
        packery_grid.layout();
    }
    
    init();
    
}