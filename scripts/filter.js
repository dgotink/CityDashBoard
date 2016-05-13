var filterData = function(color, theme, xName, yName, input, name, callback){
    var method = function(data){
        var dataArr = data.data;
        dataArr = dataArr.map(function (i) {
            return { 'x': pick(xName, i), 'y': pick(yName, i) };
        });
        var out = { 'name': name, 'color': color, 'theme': theme, 'data': dataArr };
        callback(out);
    };
    read(input, method);
};

function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}

