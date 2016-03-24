var assert = require('assert');
var mongodb = require('mongodb');
var spawn = require('child_process').spawn;

var MongoClient = mongodb.MongoClient;
var	url = 'mongodb://134.58.106.9/admin';

MongoClient.connect(url, function(err, db) {
	if (err) 
		console.log('Unable to connect to the MongoDB server. Error:', err);
	else {
		console.log('Connected to ', url);
		// Authenticate
		console.log('Starting authentication...');
		db.authenticate('dries_gotink', 'r[x]dIntern!1', function(err, result) {
			if (err) 
				console.log('Unable to authenticate. Error:', err);
			else {
				assert.equal(true, result)
				console.log('Succesfully authenticated to database .', db.databaseName);
				db = db.db('weather');
				console.log('Now connected to database .', db.databaseName);
				console.log('Requesting collections...')
				db.listCollections().toArray(function(err, colNames) {
					if (err) return  console.log(err);
					else {
						console.log('Succesfully obtained the collections.');
						colNames.forEach(function(name) {
							console.log(name);
							var mongoExport = spawn('mongoexport', [ '--host', '134.58.106.9', '--authenticationDatabase', 'admin', '--username', 'dries_gotink', '--password', 'r[x]dIntern!1', '--db', db.databaseName,
							'--collection', name.name, '--jsonArray', '-o', name.name + 'recent.json']);
						});
						db.close();
					}
				});
			}
		});	
	}
});
