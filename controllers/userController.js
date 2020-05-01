const User = require('../models/User')
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)

exports.findOrCreateUser = async token => {
    //verify auth token
    const googleUser = await verifyAuthToken(token)
    console.log("google user " + googleUser.email)
    //check if user exists
    const user =  await checkIfUserExists(googleUser.email)
    console.log("user " + user)
     //if user exists, return them, otherwise create new user in db
     return user ? user : createNewUser(googleUser)
}

const verifyAuthToken = async token => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience:process.env.OAUTH_CLIENT_ID

        })
        //returns google user
        return ticket.getPayload()
    } catch(err){
        console.error("error authentication token " + err)
    }
}

const checkIfUserExists = async email => {
    return await User.findOne({email}).exec()
}

const createNewUser = googleUser => {
    const {name, email, picture} = googleUser;
    const user = {name, email, picture}
    console.log("user within createNewUser " + JSON.stringify(user))
    return new User(user).save()
}