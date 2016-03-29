function filterData(color, xName, yName, input, object, element, callback){
    d3.json(input, function(data){
	var dataArr = data.data;
        dataArr = dataArr.map(function (i) {
            return { "x": pick(xName, i), "y": pick(yName, i) };
        });
        var out = { "name": data.name, "color": color, "data": dataArr };
        callback(object, element, out);
    });
}

function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}

