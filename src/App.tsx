import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Header from './components/Header/Header';
import Menu from './containers/Menu/Menu';
import Main from './containers/Main/Main';
import Alert from './containers/Alert/Alert';

import s from './App.module.css';

function App() {
  return (
    <div className={s.app}>
      <div className={s.container}>
        <Header/>
        <Menu/>
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
