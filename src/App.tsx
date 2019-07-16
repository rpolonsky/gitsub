import React from 'react';
import Main from './containers/Main/Main';
import Header from './components/Header/Header';
import Alert from './containers/Alert/Alert';

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
