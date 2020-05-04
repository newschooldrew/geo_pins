import React, {useContext} from "react";
import {GoogleLogout} from 'react-google-login'
import { withStyles } from "@material-ui/core/styles";
import Context from '../../context'
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery'

const Signout = ({ classes }) => {
  const {dispatch} = useContext(Context)
  const mobileSize = useMediaQuery('(max-width:650px)')

  const onSignOut = () =>{
    dispatch({type:"SIGN_OUT_USER"})
    console.log("sign out user")
  }
  return (
    <GoogleLogout
      onLogoutSuccess={onSignOut}
      render={({onClick}) =>(
        <span className={classes.root} onClick={onClick}>
          <Typography
              style={{display:mobileSize ? "none" : "block"}}
              variant="body1"
              className={classes.buttonText}
          >
            Signout
          </Typography>
          <ExitToAppIcon className={classes.buttonIcon} />
        </span>
      )}
      />
  )
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonText: {
    color: "orange"
  },
  buttonIcon: {
    marginLeft: "5px",
    color: "orange"
  }
};

export default withStyles(styles)(Signout);
