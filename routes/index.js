const searchRoutes = require("./search");
const loginRoutes = require("./login");

const constructorMethod = (app) => {
    app.use("/search", searchRoutes);
    app.use("/login", loginRoutes);

    app.use("*", (req, res) => {
    	res.render("home");
    });
};

module.exports = constructorMethod;