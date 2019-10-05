import React from 'react';

import s from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={s.footer}>
      <p>Copyright (c) 2019-{(new Date()).getFullYear()} Roman Polonsky. All rights reserved.</p>
      <p>
        By continuing to use this site, you agree to our use of cookies, localStorage and other
        tracking technologies.
      </p>
    </footer>
  );
};

export default Footer;
