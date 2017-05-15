const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuidV4 = require('uuid/v4');
const bcrypt = require('bcrypt-nodejs');

let exportedMethods = {
    getAllUsers() {
        return users().then((userCollection) => {
            return userCollection
                .find({})
                .toArray();
        });
    },
    getUserById(id) {
        if (typeof id !== "string")
            return Promise.reject("Expected string for user id.");
        if (id === "")
            return Promise.reject("No user id provided.");
        return users().then((userCollection) => {
            return userCollection
                .findOne({_id: id})
                .then((user) => {
                    if (!user)
                        throw "User not found";
                    return user;
                });
        });
    },
    getUserByUsername(username) {
        if (typeof username !== "string")
            return Promise.reject("Expected string for username.");
        if (username === "")
            return Promise.reject("No username provided.");
        return users().then((userCollection) => {
            return userCollection
                .findOne({username: username})
                .then((user) => {
                    return user;
                });
        });
    },
    addUser(username, password) {
        if (typeof username !== "string")
            return Promise.reject("Expected string for username.");
        // NOTE(k): This isn't proper form validation but it's probably good
        // enough for our purposes
        if (username === "") {
            return Promise.reject("No username provided.");
        }

        if (typeof password !== "string")
            return Promise.reject("Expected string for password.");
        if (password === "") {
            return Promise.reject("No password provided.");
        }
        return users().then((userCollection) => {
            let freshId = uuidV4();
            let hashedPassword = bcrypt.hashSync(password);
            let newUser = {
                _id: freshId,
                username: username,
                hashedPassword: hashedPassword
            };

            return userCollection
                .insertOne(newUser)
                .then((newInsertInformation) => {
                    return newInsertInformation.insertedId;
                })
                .then((newId) => {
                    return this.getUserById(newId);
                });
        });
    }
};

module.exports = exportedMethods;
