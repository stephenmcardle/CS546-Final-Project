const express = require('express');
const router = express.Router();
const data = require("../data");
const emailData = data.emails;
const fs = require('fs');

router.get("/", (req, res) => {
	res.render('search');
});


router.post("/", (req, res) => {
	const first = req.firstname;
	const last = req.lastname;
	const phrase = req.phrase;
	const branch = req.branch;
	const party = req.party;
	emailData.findEmails(first, last, phrase, branch, party).then((emails) => {
		res.json(emails);
	});
});

router.post("/download", (req, res) => {
	console.log("got to download route");
	if (!req.user) {
		res.render('/search', {message: "Must be logged in to search"});
	} else {
		if(req.body.firstname === "" && req.body.lastname === ""){
			emails.findEmails5(req.body.phrase).then((x) => {
				res.render('search',{emails:x});
				var currentdate = new Date();
			  	var datetime = currentdate.getDate() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getFullYear()
			  			+ "@" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
			  	var file = fs.writeFile('downloads/search_results' + datetime + '.txt', x, function(error) {
			  		if (error) {
			  			console.log(error);
			  		}
			  	});
			
			});
		}
		else if(req.body.firstname === ""){
			emails.findEmails3(req.body.lastname,req.body.phrase).then((x) => {
				res.render('search',{emails:x});
		});

		}
		else if(req.body.lastname === ""){
			emails.findEmails2(req.body.firstname,req.body.phrase).then((x) => {
			res.render('search',{emails:x});
		});
		}
		else{
			emails.findEmails1(req.body.firstname,req.body.lastname,req.body.phrase).then((x) => {
				res.render('search',{emails:x});
			});
		}
	}
});

module.exports = router;