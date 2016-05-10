var filterData = function(color, xName, yName, input, name, callback){
    var method = function(data){
        var dataArr = data.data;
        dataArr = dataArr.map(function (i) {
            return { "x": pick(xName, i), "y": pick(yName, i) };
        });
        var out = { "name": name, "color": color, "data": dataArr };
        callback(out);
    };
    read(input, method);
};

function filterDataAmount(color, xName, yName, input, amount, object, element, callback){
    d3.json(input, function(data){
	var dataArr = data.data;
        var dataArrAmount = [];
        var length = dataArr.length;
        var modulo = Math.floor(length/amount);
        for(var i = 0; i < length; i++){
            if(i % modulo === 0){
                dataArrAmount.push({ "x": pick(xName, dataArr[i]), "y": pick(yName, dataArr[i]) });
            }          
        }
        var out = { "name": data.name, "color": color, "data": dataArrAmount };
        callback(object, element, out);
    });
}


function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}
