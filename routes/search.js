const express = require('express');
const router = express.Router();
const data = require("../data");
const emailData = data.emails;
const fs = require('fs');
const path = require('path');

var results;

router.get("/", (req, res) => {
	res.render('search');
});


router.post("/", (req, res) => {
	if(req.body.firstname === "" && req.body.lastname === ""){
		emailData.findEmails5(req.body.phrase).then((x) => {
			results = x;
			res.render('search',{emails:x, showDownload:true});
	});
	}
	else if(req.body.firstname === ""){
		emailData.findEmails3(req.body.lastname,req.body.phrase).then((x) => {
			results = x;
			res.render('search',{emails:x, showDownload:true});
	});

	}
	else if(req.body.lastname === ""){
		emailData.findEmails2(req.body.firstname,req.body.phrase).then((x) => {
			results = x;
			res.render('search',{emails:x, showDownload:true});
	});
	}
	else{
		emailData.findEmails1(req.body.firstname,req.body.lastname,req.body.phrase).then((x) => {
			results = x;
			res.render('search',{emails:x, showDownload:true});
		});
	}
});

router.post("/download", (req, res) => {
	console.log("got to download route");
	if (!req.isAuthenticated()) {
		console.log(req.user);
		res.render('search', {message: "Must be logged in to download"});
	} else {
		var currentdate = new Date();
	  	var datetime = currentdate.getDate() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getFullYear()
	  			+ "@" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	  	var filename = path.join(__dirname, '../downloads/search_results_' + datetime + '.txt');
	  	fs.writeFile(filename, JSON.stringify(results), function(error) {
	  		if (error) {
	  			console.log(error);
	  		}
	  		var options = {
		    root: __dirname + '../downloads/',
		    dotfiles: 'deny',
		    headers: {
		        'x-timestamp': Date.now(),
		        'x-sent': true
		    }
		  };
	  		res.sendFile(filename, function(err) {
	  			if (err) console.log(err);
	  			else console.log("sent " + filename);
	  		});
	  	});
	}	

});

module.exports = router;