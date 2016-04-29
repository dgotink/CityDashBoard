function lines(data) {
    var amount = data.length;
    var graphs = {};
    var clicked = {};
    var width = 800;
    var height = calculateHeight();
    var packery;
    
    function calculateHeight() {
        return window.innerHeight;
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
        var amount_clicked = getAmountClicked();
        for (var name in graphs) {
            var tmp_height;
            if(amount === amount_clicked || amount_clicked === 0){
                tmp_height = height/amount;
            }
            else if(clicked[name]){
                tmp_height = ((height * 2)/3)/amount_clicked;
            }
                
            else {
                tmp_height = ((height)/3)/(amount - amount_clicked);
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
                        .height(height/amount)
                        .onChildClick(onChildClick);
                
                d3.select(element)
                    .call(graphs[datum.name]);
                
                clicked[datum.name] = false; 
        });
        
        packery.layout();
    }
    
    init();
}