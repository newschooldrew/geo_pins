import {GraphQLClient} from 'graphql-request';
import {useState, useEffect} from 'react';

export const useClient = () => {
    const [idToken, setIdToken] = useState('') 
    const BASE_URL = process.env.NODE_ENV === 'production' ? "" : "http://localhost:4000/graphql"
    useEffect(() => {
        const token = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
        setIdToken(token)

    },[])
    return new GraphQLClient(BASE_URL,{
        headers:{
            authorization:idToken
          }
    })
}