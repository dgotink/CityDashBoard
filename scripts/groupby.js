var groupByX = function (color, xName, yName, input, name, callback){
    var method = function(data){
        var dic = {};
        var dataArr = data.data;
        dataArr.forEach(function (i) {
            var x = pick(xName, i);
            var y = pick(yName, i);
            if(x in dic){
                if(typeof y === 'string')
                    dic[x] += parseInt(y);
                else
                    dic[x] += y;
            } 
            else {
                if(typeof y === 'string')
                    dic[x] = parseInt(y);      
                else
                    dic[x] = y;
            }     
        });
        var out = { "name": name, "color": color, "data": getArrFromDic(dic) };
        callback(out);
    };   
    read(input, method);
};

function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}

function getArrFromDic(arr){
    var output = [];
    for(key in arr){
        output.push({ "x": key, "y": arr[key] });
    }
    return output;
}