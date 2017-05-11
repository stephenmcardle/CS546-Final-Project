const express = require('express');
const router = express.Router();
const data = require("../data");
const emailData = data.emails;

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

module.exports = router;