function lines(data) {
    var length = data.length;
    var graphs = {};
    var clicked = {};
    var width = 800;
    var height = calculateHeight();
    var packery;
    
    var onSizeChangedCallback;
    var internal_counter;
    
    function calculateHeight() {
        return window.innerHeight;
    }
    
   onSizeChangedCallback = function(){
        if(internal_counter === length)
            packery.layout();             
    }
    
    var onChildClick = function (name) {
        if(clicked[name])
            clicked[name] = false;
        else
            clicked[name] = true;
        updateHeight();
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
            if(length === amount_clicked || amount_clicked === 0){
                tmp_height = height/length;
            }
            else if(clicked[name]){
                tmp_height = ((height * 2)/3)/amount_clicked;
            }
                
            else {
                tmp_height = ((height)/3)/(length - amount_clicked);
            }
                
            graphs[name].height(tmp_height);
        }
        packery.layout();   
    }
    
    function init() {
        //make the div that will contain all the linedivs
        var parent = document.createElement("div");
        parent.setAttribute("class", "lines grid");
        document.body.appendChild(parent);
        
        packery = new Packery( parent, {
            // options
            itemSelector: '.grid-item'
        });
        
        data.forEach(function(datum) { 
            var element = document.createElement("div");
                element.setAttribute("class", "linegraph grid-item");
                parent.appendChild(element);
                packery.appended(element);
                
                var draggie = new Draggabilly( element );
                packery.bindDraggabillyEvents( draggie );
                
                graphs[datum.name] = linegraph().data(datum)
                        .width(width)
                        .height(height/length)
                        .onChildClick(onChildClick)
                        .onSizeChangedCallback(onSizeChangedCallback);
                
                d3.select(element)
                    .call(graphs[datum.name]);
                
                clicked[datum.name] = false; 
        });
        
        packery.layout();
    }
    
    init();
}