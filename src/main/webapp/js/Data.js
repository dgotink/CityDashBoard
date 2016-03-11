//Puts all the parameters in an array
function merge(){
    var result = [];
    for(var i = 0; i < arguments.length; i++){
        result[i] = arguments[i];
    }
    return result;
}