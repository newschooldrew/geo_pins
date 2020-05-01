const {gql} = require('apollo-server')

module.exports = gql`
    type User{
        _id:ID
        name:String
        email:String
        picture:String
    }

    type Query{
        me:User
    }

    input CreatePinInput {
        title:String
        image:String
        content:String
        latitude:Float
        longitude:Float
    }

    type Mutation{
        createPin(input:CreatePinInput!):Pin
    }

    type Pin{
        _id:ID
        createdAt:String
        title:String
        content:String
        image:String
        longitude:Float
        latitude:Float
        author:User
        comments:[Comment]
    }
    type Comment {
        text:String
        createdAt: String
        author:User
    }
`