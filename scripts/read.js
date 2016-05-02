var baseURL = 'file:///D:/Workspaces/Netbeans Workspace/CityDashBoard/src/data/';

function read(file, callback){
    url = baseURL + file;
    d3.json(url, function(data){
		callback(data);
    });
}