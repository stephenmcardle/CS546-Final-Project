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
    addUser(firstname, lastname, username, password) {
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

        if (typeof firstname !== "string")
            return Promise.reject("Expected string for firstname.");
        if (firstname === "") {
            return Promise.reject("No firstname provided.");
        }

        if (typeof lastname !== "string")
            return Promise.reject("Expected string for lastname.");
        if (lastname === "") {
            return Promise.reject("No lastname provided.");
        }
        return users().then((userCollection) => {
            let freshId = uuidV4();
            let hashedPassword = bcrypt.hashSync(password);
            let newUser = {
                _id: freshId,
                firstname: firstname,
                lastname: lastname,
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
