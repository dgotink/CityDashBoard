function pick(string, object){
    return string.split(/\./g).reduce(function (obj, val) {
        return obj[val];
    }, object);
}

