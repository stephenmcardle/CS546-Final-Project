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
	    if (typeof email !== "object")
		    return Promise.reject("Email must be in JSON format");

	    return emails().then((emailCollection) => {
            let freshId = uuidV4();
            email._id = freshId;
    	    return emailCollection.insertOne(email).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.getEmailById(newId);
            });
        });
    },
    findEmails(firstname, lastname, phrase) {
	    return emails().then((emailCollection) => {
		    return emailCollection.findOne({ firstname: firstname, lastname: lastname, branch:branch, party:party }).then((emailCol) => {
			    return emailCol.find({ $regex: phrase, $options: 'i' }).toArray().then((emailList) => {
				    return emailList;
			    });
		    });
	    });
    },
    findEmails1(firstname, lastname, phrase) {
        return emails().then((emailCollection) => {
            return emailCollection.find({ first_name: firstname, last_name: lastname}).toArray().then((emailCol) => {
                var finalarray=[];
                for(let i=0;i<emailCol.length;i++){
                    if(emailCol[i].Body.includes(phrase)){
                        finalarray.push(emailCol[i]);
                    }
                }
                return finalarray;
                });
        });
    },
    findEmails2(firstname,phrase) {
        return emails().then((emailCollection) => {
            return emailCollection.find({ first_name: firstname}).toArray().then((emailCol) => {
                var finalarray=[];
                for(let i=0;i<emailCol.length;i++){
                    if(emailCol[i].Body.includes(phrase)){
                        finalarray.push(emailCol[i]);
                    }
                }
                return finalarray;
                });
        });
    },

    findEmails3(lastname, phrase) {
        return emails().then((emailCollection) => {
            return emailCollection.find({last_name: lastname}).toArray().then((emailCol) => {
                var finalarray=[];
                for(let i=0;i<emailCol.length;i++){
                    if(emailCol[i].Body.includes(phrase)){
                        finalarray.push(emailCol[i]);
                    }
                }
                return finalarray;
                });
        });
    },

    findEmails5(phrase) {
        return this.getAllEmails().then((emailCol) => {
                var finalarray=[];
                for(let i=0;i<emailCol.length;i++){
                    if(emailCol[i].Body.includes(phrase)){
                        finalarray.push(emailCol[i]);
                    }
                }
                return finalarray;
                });
    }

};

module.exports = exportedMethods;
