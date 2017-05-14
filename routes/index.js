const searchRoutes = require("./search");
const loginRoutes = require("./login");
const registerRoutes = require("./register");

const constructorMethod = (app) => {
    app.use("/search", searchRoutes);
    app.use("/login", loginRoutes);
    app.use("/register", registerRoutes);

    app.use("*", (req, res) => {
    	res.render("home");
    });
};

module.exports = constructorMethod;
