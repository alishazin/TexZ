
function initialize(app, UserModel) {

    signUpEndpoint(app, UserModel);

}

function signUpEndpoint(app, UserModel) {

    app.get("/api/auth/signup", (req, res) => {
        res.send("daasdsad")
    })

}

module.exports = {initialize: initialize}