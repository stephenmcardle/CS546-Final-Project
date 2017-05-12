const mongoCollections = require("../config/mongoCollections");
const emails = mongoCollections.emails;
const uuidV4 = require('uuid/v4');

exports.insertEmail = function(email) {
	if (typeof email !== "JSON")
		return Promise.reject("Email must be in JSON format");

	return emails().then((emailCollection) => {
		//TODO add uuid to the email
    	return emailCollection.insertOne(email).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return exports.getRecipeById(newId);
            });
        });
};


exports.findEmails = function(firstname, lastname, phrase, branch, party) {
	return emails().then((emailCollection) => {
		return emailCollection.find({ firstname: firstname, lastname: lastname, branch:branch, party:party }).then((emailCol) => {
			return emailCol.find({ $regex: phrase, $options: 'i' }).toArray().then((emailList) => {
				return emailList;
			});
		});
	});
};
