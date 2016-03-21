db.auth('dries_gotink', 'r[x]dIntern!1')
db = db.getSiblingDB('twitter')

print('"name":' + '"' + db + '",');
print('"data": [');
var names = db.getCollectionNames();
var delimiter = "";
names.forEach(function(name) {
	print(delimiter);
	print('{');
	print('"name":' + '"' + name + '",');
	print('"data":' + '[');
	var data = db[name].find().sort({_id : -1}).limit(1000);
	while(data.hasNext()){
		printjsononeline(data.next());
		if(data.hasNext()) print(',');
	};
	print(']');
	print('}');
	delimiter = ','; //de papa is ne slimmerik
});


print(']');
