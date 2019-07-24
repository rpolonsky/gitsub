import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Layout from './components/Layout/Layout';

import Menu from './containers/Menu/Menu';
import Main from './containers/Main/Main';
import Alert from './containers/Alert/Alert';

import { UNSUBSCRIBE, FOLLOWERS, ROOT } from './utils/routes';

import s from './App.module.css';

const App = () => {
  return (
    <div className={s.app}>
      <div className={s.container}>
        <Router>
          <Header />
          <Layout>
            <Menu />
            <Switch>
              <Route path={UNSUBSCRIBE} component={Main} />
              <Route path={FOLLOWERS} component={Main} />
              <Route exact path={ROOT} component={Main} />
            </Switch>
          </Layout>
          <Alert />
        </Router>
      </div>
    </div>
  );
};

export default App;
