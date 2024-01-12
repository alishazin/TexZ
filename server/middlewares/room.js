
function verifySessionToken(app, UserModel) {

    return async function (req, res, next) {

        const session_token = req.headers['session-token']
        console.log(session_token)

        // session_token validation

        const user = await UserModel.findOne({session_token: session_token, verified: true})
        if (!user) {
            return res.status(401).send({err_msg: "Invalid session_token"})
        }

        res.locals.user = user
        return next()

    }

}

module.exports = {verifySessionToken: verifySessionToken}