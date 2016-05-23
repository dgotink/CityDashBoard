var filter = function(color, theme, xName, yName, city, input, name, callback){
    var method = function(data){
        var dataArr = data.data;
        dataArr = dataArr.map(function (i) {
            return { 'x': pick(xName, i), 'y': pick(yName, i) };
        });
        var out = { 'name': name, 'color': color, 'theme': theme, 'city': city, 'data': dataArr };
        callback(out);
    };
    read(input, method);
};

var groupByX = function (color, theme, xName, yName, city, input, name, callback){
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
        var out = { 'name': name, 'color': color, 'theme': theme, 'city': city, 'data': getArr(dic) };
        callback(out);
    };   
    read(input, method);
};

function base(color, input, name, callback){
    var out = { 'name': name, 'color': color, 'theme': 'base' };
    var data = [];
    var amount_of_datasets = input.length;
    for(var i = 0; i < input[0].data.length; i++){
        data[i] = {'x': input[0].data[i]['x'], 'y': 0 };
        var count = 0;
        var amount = 0;
        while(count < amount_of_datasets){
            if(input[count].data[i] !== undefined){
               data[i]['y'] += input[count].data[i]['y'];
               amount++;
            }            
            count++;
        }
        data[i]['y'] = data[i]['y']/amount;
    }  
    out['data'] = data;
    var result = [];
    result.push(out);
    input.forEach(function(entry){
        result.push(entry);
    });
    callback(result);
};

function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}

function getArr(arr){
    var output = [];
    for(key in arr){
        output.push({ "x": key, "y": arr[key] });
    }
    return output;
}