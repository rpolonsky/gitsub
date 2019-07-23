import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Layout from './components/Layout/Layout';

import Menu from './containers/Menu/Menu';
import Main from './containers/Main/Main';
import Alert from './containers/Alert/Alert';

import s from './App.module.css';

const App = () => {
  return (
    <div className={s.app}>
      <div className={s.container}>
        <Header />
        <Layout>
          <Router>
            <Menu />
            <Switch>
              <Route path="/unsubscribe" component={Main} />
              <Route path="/followers" component={Main} />
              <Route exact path="/" component={Main} />
            </Switch>
          </Router>
        </Layout>
        <Alert />
      </div>
    </div>
  );
};

export default App;
