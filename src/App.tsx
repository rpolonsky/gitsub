import React from 'react';
import Main from './containers/Main';
import Header from './containers/Header';

import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <Header/>
        <Main />
      </div>
    </div>
  );
}

export default App;
