const mongoCollections = require("../config/mongoCollections");
const emails = mongoCollections.emails;
const uuidV4 = require('uuid/v4');

let exportedMethods = {
    getAllEmails() {
        return emails().then((emailCollection) => {
            return emailCollection
                .find({})
                .toArray();
        });
    },
    getEmailById(id) {
        if (typeof id !== "string")
            return Promise.reject("Expected string for email id.");
        if (id === "")
            return Promise.reject("No email id provided.");
        return emails().then((emailCollection) => {
            return emailCollection
                .findOne({_id: id})
                .then((email) => {
                    if (!email)
                        throw "Email not found";
                    return email;
                });
        });
    },
    addEmail(email) {
	    if (typeof email !== "JSON")
		    return Promise.reject("Email must be in JSON format");

	    return emails().then((emailCollection) => {
            let freshId = uuidV4();
            email._id = freshId;
    	    return emailCollection.insertOne(email).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return exports.getEmailById(newId);
            });
        });
    },
    findEmails(firstname, lastname, phrase, branch, party) {
	    return emails().then((emailCollection) => {
		    return emailCollection.find({ firstname: firstname, lastname: lastname, branch:branch, party:party }).then((emailCol) => {
			    return emailCol.find({ $regex: phrase, $options: 'i' }).toArray().then((emailList) => {
				    return emailList;
			    });
		    });
	    });
    }
};

module.exports = exportedMethods;
