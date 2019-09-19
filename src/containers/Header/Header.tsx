import React from 'react';
import { useLocation } from 'react-router-dom';

import { TITLES } from '../../utils/routes';
import { useBaseStore } from '../../stores';

import MenuButton from '../../components/MenuButton/MenuButton';

import github from '../../icons/github.png';
import linkedin from '../../icons/linkedin.png';

import s from './Header.module.css';

const Header = () => {
  const {
    main: { toggleMenuState },
  } = useBaseStore();
  const { pathname: path } = useLocation();

  return (
    <div className={s.header}>
      GitHub Subscriber
      <div className={s.controls}>
        <div className={s.mobileOnly}>
          <MenuButton onClick={toggleMenuState} className={s.menuButton} />
          {TITLES[path]}
        </div>
        <div className={s.social}>
          follow me:
          <div className={s.icons}>
            <a href="https://github.com/rpolonsky">
              <img
                src={github}
                alt="github logo"
                onClick={() => gtag('event', 'goto-github', { event_category: 'header' })}
              />
            </a>
            <a href="https://linkedin.com/in/rvpolonsky">
              <img
                src={linkedin}
                alt="linkedin logo"
                onClick={() => gtag('event', 'goto-linkedin', { event_category: 'header' })}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
