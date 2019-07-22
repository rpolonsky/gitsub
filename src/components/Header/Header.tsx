import React from 'react';

import github from '../../icons/github.png';
import linkedin from '../../icons/linkedin.png';

import s from './Header.module.css';

const Header = () => {
  return (
    <div className={s.header}>
      GitHub Subscriber
      <div className={s.social}>
        follow me:
        <div className={s.icons}>
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

export default Header;
