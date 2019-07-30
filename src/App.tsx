import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './containers/Header/Header';
import Menu from './containers/Menu/Menu';
import Unsubscribe from './containers/Unsubscribe/Unsubscribe';
import Subscribe from './containers/Subscribe/Subscribe';
import Followers from './containers/Followers/Followers';
import Alert from './containers/Alert/Alert';

import { UNSUBSCRIBE, FOLLOWERS, ROOT } from './utils/routes';

import s from './App.module.css';

const App = () => {
  return (
    <div className={s.app}>
      <div className={s.container}>
        <Router>
          <Header />
          <div className={s.page}>
            <Menu />
            <div className={s.content}>
              <Switch>
                <Route path={UNSUBSCRIBE} component={Unsubscribe} />
                <Route path={FOLLOWERS} component={Followers} />
                <Route exact path={ROOT} component={Subscribe} />
              </Switch>
            </div>
          </div>
          <Alert />
        </Router>
      </div>
    </div>
  );
};

export default App;
