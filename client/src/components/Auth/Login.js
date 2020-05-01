import React ,{useContext} from "react";
import {GraphQLClient} from 'graphql-request'
import {GoogleLogin} from 'react-google-login'
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {ME_QUERY} from '../../graphql/queries'
import Context from '../../context'
import {BASE_URL} from '../../client'

const Login = ({ classes }) => {
  const {dispatch} = useContext(Context)

  const onFailure = err =>{
    console.error("there was an error" + err)
  }

  const onSuccess = async googleUser =>{
    try{
    const idToken = googleUser.getAuthResponse().id_token
    const client = new GraphQLClient('http://localhost:4000/graphql',{
      headers:{authorization:idToken}
    })
    const {me} = await client.request(ME_QUERY);
      console.log({me})
      dispatch({type:"LOGIN_USER",payload:me})
      dispatch({type:"IS_LOGGED_IN",payload:googleUser.isSignedIn()})
    } catch(err){
      onFailure(err)
    }
  }
  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
      >
        Hi there
      </Typography>
    <GoogleLogin 
        clientId="203185452123-7eaicefd36svfvcob9hm83914c57113k.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn="true"
        theme="dark"
        buttonText="Log In"
      />
    </div>
  )
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
