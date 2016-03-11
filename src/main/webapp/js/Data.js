var arr = {};

function add(){
    for(var i = 0; i < arguments.length; i++){
        arr[arguments[i].Name] =  arguments[i];
    }
    CreateCollectedGraphBox(getArr());
}

function remove(){
    for(var i = 0; i < arguments.length; i++){
        delete arr[arguments[i].Name];
    }
    CreateCollectedGraphBox(getArr());
}

function swap(){
    for(var i = 0; i < arguments.length; i++){
        if(arr.hasOwnProperty(arguments[i].Name)){
            remove(arguments[i]);
        } else {
            add(arguments[i]);
        }
    }
    return getArr();
}

function getArr(){
    var output = [];
    for(key in arr){
        if(arr.hasOwnProperty(key)){
            output.push(arr[key]);
        } 
    }
    return output;
}