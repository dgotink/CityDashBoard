var baseURL = 'data/';

function read(file, callback){
    url = baseURL + file;
    d3.json(url, function(data){
        callback(data);
    });
}