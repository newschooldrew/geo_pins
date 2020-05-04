import React, {useState, useEffect, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl'
import PinIcon from './PinIcon'
import Context from '../context'
import Blog from './Blog'
import {useClient} from '../client'
import {GET_PINS} from '../graphql/queries'
import {DELETE_PIN} from '../graphql/mutations'
import {Subscription} from 'react-apollo'
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery'

import {PIN_ADDED_SUBSCRIPTION,PIN_UPDATED_SUBSCRIPTION,PIN_DELETED_SUBSCRIPTION} from '../graphql/subscriptions'
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
  const mobileSize = useMediaQuery('(max-width:650px)')
  const {state,dispatch} = useContext(Context) 

  useEffect(() =>{
      const pinExists = popup && state.pins.findIndex(pin =>pin._id === popup._id ) > -1

      console.log(pinExists)
      if (!pinExists){
        setPopup(null)
      }
  },[state.pins.length])

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
    await client.request(DELETE_PIN, variables)
    setPopup(null)
  }

  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        scrollZoom={!mobileSize}
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
        {/* Set a marker based off your own position */}
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
        {/* Set a marker based off the user's click */}
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
        {/* Map out created pins */}
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
                <Subscription 
                  subscription={PIN_ADDED_SUBSCRIPTION}
                  onSubscriptionData={({subscriptionData}) =>{
                    const {pinAdded} = subscriptionData.data;
                    dispatch({type:"CREATE_PIN",payload:pinAdded})
                  }}
                />
                <Subscription 
                  subscription={PIN_UPDATED_SUBSCRIPTION}
                  onSubscriptionData={({subscriptionData}) =>{
                    const {pinUpdated} = subscriptionData.data;
                    dispatch({type:"ADD_COMMENT",payload:pinUpdated})
                  }}
                />
                <Subscription 
                  subscription={PIN_DELETED_SUBSCRIPTION}
                  onSubscriptionData={({subscriptionData}) =>{
                    const {pinDeleted} = subscriptionData.data;
                    dispatch({type:"DELETE_PIN",payload:pinDeleted})
                  }}
                />                
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
