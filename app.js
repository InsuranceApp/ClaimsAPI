/*eslint-env node*/

/**
 * @author Madhurya Malladi
 
 * Created on 11/05/2016
 */

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var async = require('async');
var Cloudant = require('cloudant');
var cloudant = Cloudant({url: 'https://c8471542-8b25-4c18-8533-68457a121a4e-bluemix:98b2d738277220eede0580c59102e6574d39cabe6d08ba57e5f6d3a5d8555aab@c8471542-8b25-4c18-8533-68457a121a4e-bluemix.cloudant.com'});

 //Database operations
				var	  dbname = 'quotestore';
				var manufacturerdbname = 'manufacturers';
					var  db = null;
					var manufacturerdb = null;
					var  db = cloudant.db.use(dbname);
					var manufacturerdb = cloudant.db.use(manufacturerdbname);

var bodyParser = require('body-parser');



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






/***************************************************************************************/
// Quote creation
/***************************************************************************************/ 

 app.post('/api/createquote', urlencodedParser, function (req, res) {
	
							console.log("Initial Request:", req.body);
					 
					
					 var request = req.body;
					  console.log("Creating document 'mydoc'");
					  // we are specifying the id of the document so we can update and delete it later
					  db.insert(request, function(err, data) {
						console.log("Inserting into DB");
						console.log("Error:", err);
						console.log("Data:", data);
						var id = data.id;
						console.log("ID" , id);
						var result =[];
						result.push({price: '10,000', idv: '5,000'});
		  				res.send(JSON.stringify(result));
							
					  });
				
				

});


/***************************************************************************************/
//Retrieve All Manufacturers
/***************************************************************************************/ 

 app.get('/api/getallmanufacturers', urlencodedParser, function (req, res) {
		
					var manufacturerList = function() {
						
					  	
					  	 manufacturerdb.list(function(err, body) {
					var result = [];
						body.rows.forEach(function(doc) {
      					console.log("Response from DB " , doc);
      				
      					var manufacturerid= doc.id;
						manufacturerdb.get(manufacturerid, function(err, data) {
							console.log("Individual Data:", data);
							
							result.push({id: data._id, manufacturer_name: data.manufacturer_name});
							console.log("Result", result);

						});

					 });
				
					 });
				
				
					  	
					  };
					
					  console.log("Retrieving all manufacturers ");
					  
					  var resultFromDB = manufacturerList();
					  
					  console.log("resultFromDB", resultFromDB);
					  
						res.send(JSON.stringify(resultFromDB));
												 
		});
	


												 
	
				
					

					
				
				