/*eslint-env node*/

/**
 * @author RAJA PINJA
 * Auto Quotation Restful API Handles calls for (Creation, Search, Update and Delete quotations
 * from a web app or mobile app as cloud Bluemix API
 * 
 * RestFul API can be consumed by accessing following URIs/URLs (local host should be replaced with actual IP address
 * HTTP - POST (creation of an auto quotation) - https://nodejstest.au-syd.mybluemix.net/api/quotes
 * HTTP - GET  (retrievs all existing inprogress/completed quotations) - http://nodejstest.au-syd.mybluemix.net/api/quotes/retrievall
 * HTTP - GET  (retrievs an existing quotation) - http://nodejstest.au-syd.mybluemix.net/api/quotes/retrieone/:quote_code
 * HTTP - PUT (updates an existing quotation) - http://nodejstest.au-syd.mybluemix.net/api/quotes/update/:quote_code
 * HTTP - DELETE (delets an existing quotation) - http://nodejstest.au-syd.mybluemix.net/api/quotes/delete/:quote_code
 * Created on 17/03/2016
 */

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

var bodyParser = require('body-parser');


var mongodb = require('mongodb');

var fs = require("fs");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});


var mongo="mongodb://raja_pinja:lasya11june@aws-us-east-1-portal.13.dblayer.com:10616/autoquotes";
if (process.env.VCAP_SERVICES) {
var env = JSON.parse(process.env.VCAP_SERVICES);
if (env['mongodb-2.2']) {
 	mongo = {
	"username" : "raja_pinja",
	"password" : "lasya11june",
	"url" : "mongodb://raja_pinja:lasya11june@aws-us-east-1-portal.13.dblayer.com:10616/autoquotes"
	};
}
} else {
	mongo = {
	"username" : "raja_pinja",
	"password" : "lasya11june",
	"url" : "mongodb://raja_pinja:lasya11june@aws-us-east-1-portal.13.dblayer.com:10616/autoquotes"
	};
}


//With this as the connector
var MongoClient = mongodb.MongoClient;


/***************************************************************************************/
//1.Begin Quote creation process
/***************************************************************************************/
app.post('/api/quotes', urlencodedParser, function (req, res) {
	
	 //console.log("Inside POST :Begin");
	 
	 
 /***************************************************************************************/
//Begin Quote ID generation process
/***************************************************************************************/  
	//Begin generate
  //Generates 8 characters Unique ID 25 power 8 - 152 Billions unique ids
  // which can be used as quotation id

	var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var ID_LENGTH = 8;

	var generate = function() {
		var rtn = '';
		for (var i = 0; i < ID_LENGTH; i++) {
			rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
		} 
		return rtn;
	};
	//call generate() function to get am unique id
	 var quoteid = generate();
	 console.log("Inside Genertre");
	 console.log(quoteid);

/***************************************************************************************/
//End generate
/***************************************************************************************/
	// to get price value from .json file
	var price;
	
	// Read existing json data file
   fs.readFile("./autodetails.json", 'utf8', function (err, data) {
   	console.log("Inside FS Read");
	   var quickquote = JSON.parse(data);
	   console.log(JSON.stringify(data));
	   //var price = quickquote[[req.body.vehicle_model][req.body.vehicle_make]];
	   for (var make in quickquote.cars) {
			for (var model in quickquote.cars[make]) {			 
				if( model === req.body.vehicle_model){
					//console.log(quickquote.cars[make]);
					//console.log(req.body.vehicle_model);
					price = quickquote.cars[make][model].price;
					console.log( price );								
					 // Prepare output in JSON format
					 
					var response = {
						quote_code:quoteid,
						first_name:req.body.first_name,
						last_name:req.body.last_name,	   
						mobile_num:req.body.mobile_num,
						vehicle_make:req.body.vehicle_make,
						vehicle_model:req.body.vehicle_model,
						vehicle_veriant:req.body.vehicle_variant,
						year_of_manufacturer:req.body.year_of_manufacturer,
						date_of_purchase:req.body.date_of_purchase,
						insurance_for:req.body.insurance_for,
						customer_type:req.body.customer_type,
						registration_num:req.body.registration_num,
						idv:req.body.idv,
						quote_price : price				
					};
					 console.log(response);
						// Use connect method to connect to the Server
						 MongoClient.connect(mongo, function (err, db) {
						  if (err) {
							console.log('Unable to connect to the mongoDB server. Error:', err);
						  } else {
							//HURRAY!! We are connected.
							console.log('Connection established to', mongo);

							// Get the documents collection
							var collection = db.collection('quotes');

							
							// Insert some users
							collection.insert(response, function (err, result) {
							  if (err) {
								console.log(err);
							  } else {
								console.log('Inserted %d documents into the "quotes" collection. The documents inserted with "_id" are:', result.length, result);
							  }
							  //Close connection
							  db.close();
							});
						  }
						});
					//console.log( "Please see below , Quick quote for your Vehicle");
					res.end(JSON.stringify(response));
					break;
				}
				
			}
			
		}
      
   });
  
   
});
/***************************************************************************************/
//End Quote creation
/***************************************************************************************/

/***************************************************************************************/
// 2.Begin Retrievs all quotations from MongoDB
/***************************************************************************************/
app.get('/api/quotes/retrievall',function (req, res) {

		// Use connect method to connect to the Server
		MongoClient.connect(mongo, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected.
			console.log('Connection established to', mongo);

			// Get the documents collection
			var collection = db.collection('quotes');
			
			// Insert some users
			collection.find().toArray (function (err, result) {
			  if (err) {
				console.log(err);
			  } else if (result.length) {
				console.log('Found:', result);
			  } else {
				console.log('No document(s) found with defined "find" criteria!');
			  }
			 db.close();
			 console.log( JSON.stringify(result));
			 res.end( JSON.stringify(result));
			});
		  }
		});
		  
   
});
/***************************************************************************************/
// End Retrievs all quotations from MongoDB
/***************************************************************************************/

/***************************************************************************************/
//3.Begin Retrievs a single quotation from MongoDB
/***************************************************************************************/
app.get('/api/quotes/reteiveone/:quote_code', function (req, res) {

		// Use connect method to connect to the Server
		MongoClient.connect(mongo, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected.
			console.log('Connection established to', mongo);

			// Get the documents collection
			var collection = db.collection('quotes');
			//console.log(param);
			// Insert some users
			collection.find({quote_code:req.params.quote_code}).toArray (function (err, result) {
			  if (err) {
				console.log(err);
			  } else if (result.length) {
				console.log('Found:', result);
			  } else {
				console.log('No document(s) found with defined "find" criteria!');
			  }
			  //Close connection
			  db.close();
			 res.end( JSON.stringify(result));
			});
		  }
		});
});
/***************************************************************************************/
// End Retrievs quotation from MongoDB
/***************************************************************************************/

/***************************************************************************************/
// 4. Update Quote : Begin
/***************************************************************************************/	 
app.get('/api/quotes/update/:quote_code', function (req, res) {

/***************************************************************************************/
  //Begin generate
  //Generates 8 characters Unique ID 25 power 8 - 152 Billions unique ids
  // which can be used as quotation id
/***************************************************************************************/
	var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var ID_LENGTH = 8;

	var generate = function() {
		var rtn = '';
		for (var i = 0; i < ID_LENGTH; i++) {
			rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
		} 
		return rtn;
	}
	//call generate() function to get am unique id
	 var quoteid = generate();
/***************************************************************************************/
	 //End generate
/***************************************************************************************/	 
	 
		// Use connect method to connect to the Server
		MongoClient.connect(mongo, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected.
			console.log('Connection established to', mongo);

			// Get the documents collection
			var collection = db.collection('quotes');

				// Insert some users
				collection.update({"quote_code":req.params.quote_code}, {$set:{"quote_price": 45000}}, (function (err, result) {
				  if (err) {
					console.log(err);
				  } else if (result) {
					console.log('Updated Successfully %d document(s).', result);
				}else {
					console.log('No document(s) found with defined "update" criteria!');
				  }
				  //Close connection
				  db.close();
				  res.end( JSON.stringify(result));
				})
				);
		 
			}
			});
			
});
/***************************************************************************************/
//End Update quotation 
/***************************************************************************************/

/***************************************************************************************/
//5.Begin  Delete quotation
/***************************************************************************************/
app.get('/api/quotes/delete/:quote_code', function (req, res) {

		// Use connect method to connect to the Server
		MongoClient.connect(mongo, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected.
			console.log('Connection established to', mongo);

			// Get the documents collection
			var collection = db.collection('quotes');
			
	
			// delete a quote(document) from quotes collection
		   collection.deleteOne({quote_code:req.params.quote_code}, function(err, result) {
			  if (err) {
				console.log(err);
			  } else if (result.length) {
				console.log('Found:', result);
			  } else {
				console.log('document has been deleted successfully!');
			  }
			  //Close connection
			  db.close();
			 res.end( JSON.stringify(result));
			});
		  }
		});
		  
		   
});
/***************************************************************************************/
//End Delete quotation
/***************************************************************************************/