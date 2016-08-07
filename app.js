/*eslint-env node*/

/**
 * @author Madhurya Malladi
 
 * Created on 07/08/2016
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

var nano = require('nano')('https://c8471542-8b25-4c18-8533-68457a121a4e-bluemix:98b2d738277220eede0580c59102e6574d39cabe6d08ba57e5f6d3a5d8555aab@c8471542-8b25-4c18-8533-68457a121a4e-bluemix.cloudant.com');

 //Database operations
					var	  dbname = 'quotestore';
					var claimdbase ='claimdatabase';
					var claimSearchDBName = 'claimdatabase';
					var  db = null;
					var  db = cloudant.db.use(dbname);
					var claimdb = nano.db.use(claimdbase);
					var claimSearchDB = nano.db.use(claimSearchDBName);
					
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
// Create Claim
/***************************************************************************************/ 

 app.post('/api/createclaim', urlencodedParser, function (req, res) {
	
							console.log("Initial Request:", req.body);
					 
					
					 var request = req.body;
					  console.log("Creating document 'mydoc'");
					  // we are specifying the id of the document so we can update and delete it later
					  claimdb.insert(request, function(err, data) {
						console.log("Inserting into DB");
						console.log("Error:", err);
						console.log("Data:", data);
						var id = data.id;
						console.log("ID" , id);
						var response = request;
						response._id = id;
						console.log("Response", response);
		  				res.end(JSON.stringify(response));
							
					  });
				
				

});


		
/***************************************************************************************/
// Get Quote by emailID
/***************************************************************************************/ 


 app.get('/api/getQuoteByEmail/:client_id', urlencodedParser, function (req, res) {
	
	console.log("ClientID from Req", req.params.client_id);
	
	var client_id = req.params.client_id;

	db.view('getQuoteByEmail', 'getQuoteByEmail', {key : client_id} , function(err, body)
		{
			if (!err) {
		    var result = [];
		      body.rows.forEach(function(doc) {
		      	console.log("Doc from DB ", doc);
		        result.push({client_id: doc.key, vehicle_name: doc.value.manufacturer_name});
		        
		      });
		      res.send(JSON.stringify(result));
    }
		});
		
	});
	
	
/***************************************************************************************/
//Claim Search (Inquire Claim) 
/***************************************************************************************/ 

	 app.get('/api/searchClaim/:email_id', urlencodedParser, function (req, res) {
		
	
	console.log("Parameters from request", req.params.email_id);
	
	var email_id = req.params.email_id;

		claimSearchDB.view('searchClaim', 'searchClaim', {key : email_id} , function(err, body)
		{
			if (!err) {
		    var result = [];
		    
		      body.rows.forEach(function(doc) {
		      	console.log("Doc from DB ", doc);
		        result.push({claim_id: doc.value.claim_id, submitted_on: doc.value.submitted_on, claim_amt: doc.value.claim_amt, status: doc.value.status});
		        
		        
		      });
		      res.send(JSON.stringify(result));
		    
    }
		});
		
	});
		
	
	
