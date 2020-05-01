const {ApolloServer} = require('apollo-server')
const mongoogse = require('mongoose')
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers')
const {findOrCreateUser} = require('./controllers/userController')
require('dotenv').config()

mongoogse.connect(process.env.MONGO_URI,
    {useNewUrlParser:true})
    .then(() =>console.log('DB connected'))
    .catch(err => console.error(err))


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) =>{
        let authToken = null;
        let currentUser = null;
        try{
            authToken = req.headers.authorization;
            if(authToken){
                currentUser = await findOrCreateUser(authToken)
            }
        } catch(err){
            console.error(`Not able to authenticate user with ${authToken}`)
        }
        return {currentUser}
    }
})

server.listen().then(({url}) =>{
    console.log(`server is listening on ${url}`)
})