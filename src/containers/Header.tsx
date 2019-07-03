import React from 'react';
import { observer } from 'mobx-react';

import github from '../icons/github.png';
import linkedin from '../icons/linkedin.png';

import './Header.css';

const Header = () => {
  return (
    <div className="header">
      GitHub Subscriber
      <div className="social">
        follow me:
        <div className="icons">
          <a href="https://github.com/rpolonsky">
            <img src={github} alt="github logo" />
          </a>
          <a href="https://linkedin.com/in/rvpolonsky">
            <img src={linkedin} alt="linkedin logo" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default observer(Header);
