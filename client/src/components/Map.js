import React, {useState, useEffect, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl'
import PinIcon from './PinIcon'
import Context from '../context'
import Blog from './Blog'
import {useClient} from '../client'
import {GET_PINS} from '../graphql/queries'
import {DELETE_PIN} from '../graphql/mutations'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

const INITIAL_VIEWPORT = {
  longitude:-73.949997,
  latitude: 40.650002,
  zoom: 14
}

const Map = ({ classes }) => {
  const client = useClient()
  const {state,dispatch} = useContext(Context) 

  useEffect(() => {
    getPins()
  },[])

  const [viewport,setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null)

  useEffect(()=>{
    getUserPosition()
  },[])

const [popup,setPopup] = useState(null)

  const getUserPosition = () =>{
    if("geolocation"in navigator){
      navigator.geolocation.getCurrentPosition(position =>{
        const {longitude, latitude} = position.coords;
        setViewport({...viewport,latitude, longitude})
        setUserPosition({latitude,longitude})
      })
    }
  }

  const getPins = async () =>{
    const {getPins} = await client.request(GET_PINS)
    dispatch({type:"GET_PINS",payload:getPins})
  }

  const handleMapClick = ({lngLat,leftButton}) => {
      if(!leftButton) return

      if(!state.draft){
        dispatch({type:"CREATE_DRAFT"})
      }
      const [longitude,latitude] = lngLat;
      dispatch({
        type:"UPDATE_DRAFT_LOCATION",
        payload:{longitude,latitude}
      })
  }

  const highlightNewPin = pin =>{
    const isNewPin = differenceInMinutes(Date.now(),Number(pin.createdAt)) < 60
    return isNewPin ? "hotpink" : "blue"
  }

  const handleSelectPin = pin => {
    setPopup(pin)
    dispatch({type:"SET_PIN",payload:pin})
  }

  const isAuthUser = () => state.currentUser._id === popup.author._id

  const handleDelete = async popup => {
    const variables = {pinId:popup._id}
    const {deletePin} = await client.request(DELETE_PIN, variables)
    dispatch({type:"DELETE_PIN",payload:deletePin})
    setPopup(null)
  }

  return (
    <div className={classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoibmV3c2Nob29sZHJldyIsImEiOiJjazluYmtpNXUwMDRtM2x0OGg2NTI5NjAyIn0.uy61TeD5vkt_0WreUMEm-w"
        onViewportChange={newViewport => setViewport(newViewport)}
        onClick={handleMapClick}
        {...viewport}
      >
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={newViewport => setViewport(newViewport)}
          />
        </div>
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon 
              size={40} 
              color="red"
              />
          </Marker>
        )}
        {state.draft && (
                    <Marker
                    latitude={state.draft.latitude}
                    longitude={state.draft.longitude}
                    offsetLeft={-19}
                    offsetTop={-37}
                  >
                    <PinIcon 
                      size={40} 
                      color="blue"
                      />
                  </Marker>
        )}
        {/* Created pins */}
        {
          state.pins.map(pin =>(
            <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon 
              size={40} 
              color={highlightNewPin(pin)}
              onClick={() => handleSelectPin(pin)}
              />
          </Marker>
          ))}
          {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img 
            src={popup.image}
            className={classes.popupImage}
            />
            <div className={classes.popupTab}>
              <Typography>
              {popup.latitude.toFixed(4)}
              {popup.longitude.toFixed(4)}
              </Typography>
              {isAuthUser && (
              <DeleteIcon 
                className={classes.deleteIcon}
                onClick={() => handleDelete(popup)}
              >
                Delete Pin
                </DeleteIcon>
              ) }
            </div>
          </Popup>)}
      </ReactMapGL>

      <Blog />
    </div>
  )
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
