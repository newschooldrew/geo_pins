import React,{useContext,useReducer} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute'

import Context from './context'
import Reducer from './reducer'

import App from "./pages/App";
import Splash from "./pages/Splash";

import "mapbox-gl/dist/mapbox-gl.css";
import * as serviceWorker from "./serviceWorker";

import {ApolloProvider} from 'react-apollo'
import {ApolloClient} from 'apollo-client'
import {WebSocketLink} from 'apollo-link-ws'
import {InMemoryCache} from 'apollo-cache-inmemory' 


const wsLink = new WebSocketLink({
  uri:'wss://graphql-react-map.herokuapp.com/graphql',
  options:{
    reconnect:true
  }
})

const client = new ApolloClient({
  link:wsLink,
  cache:new InMemoryCache()
})

const Root = () => {
  const INITIAL_STATE = useContext(Context);
  const [state, dispatch] = useReducer(Reducer,INITIAL_STATE)
  console.log({state})
    // state = state after your reducer has run
    // dispatch allows you to dispatch actions

  return (
    <Router>
      <ApolloProvider client={client}>
      <Context.Provider value={{state,dispatch}}>
        <Switch>
          <ProtectedRoute exact path="/" component={App} />
          <Route path="/login" component={Splash} />
        </Switch>
      </Context.Provider>
      </ApolloProvider>
    </Router>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
