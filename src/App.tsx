import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Main from './containers/Main/Main';
import Header from './components/Header/Header';
import Alert from './containers/Alert/Alert';

import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <Header/>
        <Router>
          <Switch>
            <Route path="/subscribe" component={Main}/>
            <Route path="/unsubscribe" component={Main}/>
            <Route path="/followers" component={Main}/>
            <Route exact path="/" component={Main}/>
          </Switch>
        </Router>
        <Alert />
      </div>
    </div>
  );
}

export default App;
