import React from 'react';
import Main from './containers/Main';
import Header from './containers/Header';
import Alert from './containers/Alert';

import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <Header/>
        <Main />
        <Alert />
      </div>
    </div>
  );
}

export default App;
