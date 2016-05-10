function lines(data) {
    var internal_counter;
    var length = data.length;
    var graphs = {};
    var clicked = {};
    
    var width = window.innerWidth;
    var contextHeight = 50;
    var height = calculateHeight();
    
    var packery_main;
    var packery_linegraphs;    
    
    function calculateHeight() {
        return window.innerHeight - contextHeight;
    }
    
    var onSizeChangedCallback = function(){
       internal_counter++;
        if(internal_counter === length)
            packery_linegraphs.layout();       
    };
    
    var onChildClick = function (name) {
        if(clicked[name])
            clicked[name] = false;
        else
            clicked[name] = true;
        updateHeight();
    };
    
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
    
    function updateHeight() {
        internal_counter = 0;
        var amount_clicked = getAmountClicked();
        for (var name in graphs) {
            var tmp_height;
            if(length === amount_clicked || amount_clicked === 0)
                tmp_height = height/length;
            else if(clicked[name])
                tmp_height = ((height * 2)/3)/amount_clicked;
            else 
                tmp_height = ((height)/3)/(length - amount_clicked); 
            graphs[name].height(tmp_height);
        } 
    }
    
    function init() {
        var main = document.createElement('div');
        main.setAttribute('class', 'main');
        document.body.appendChild(main);
        //make the div that will contain all the linedivs
        var parent = document.createElement('div');
        parent.setAttribute('class', 'lines grid main-item');
        main.appendChild(parent);
        
        packery_main = new Packery( main, {
            // options
            columnWidth: window.innerWidth,
            itemSelector: '.main-item'
        });
        
        packery_linegraphs = new Packery( parent, {
            // options
            columnWidth: window.innerWidth,
            itemSelector: '.grid-item'
        });
        
        packery_main.appended(packery_linegraphs);
        
        data.forEach(function(datum) { 
            var element = document.createElement('div');
                element.setAttribute('class', 'linegraph grid-item');
                parent.appendChild(element);
                packery_linegraphs.appended(element);
                
                var draggie = new Draggabilly( element );
                packery_linegraphs.bindDraggabillyEvents( draggie );
                
                graphs[datum.name] = linegraph().data(datum)
                        .width(width)
                        .height(height/length)
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
        main.appendChild(element);
        packery_main.appended(element);
        
        var context = contextgraph().data(data)
                .onChildBrushed(onChildBrushed);
                
        d3.select(element).call(context);
        
        packery_linegraphs.layout();
        packery_main.layout();
    }
    
    init();
}