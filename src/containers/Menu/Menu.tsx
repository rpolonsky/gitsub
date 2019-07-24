import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation, useHistory } from 'react-router-dom';
import cx from 'classnames';

import { ROOT, UNSUBSCRIBE, FOLLOWERS } from '../../utils/routes';
import Section from '../../components/Section/Section';
import { useBaseStore } from '../../stores';

import s from './Menu.module.css';

const Menu = () => {
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const { pathname: path } = useLocation();
  const { push } = useHistory();

  const {
    main: { remainingRateLimit },
  } = useBaseStore();

  return (
    <div className={s.menu}>
      {!!remainingRateLimit && (
        <Section title="rate limits">
          <div>
            available: {remainingRateLimit.remaining} out of {remainingRateLimit.limit} requests
          </div>
          <div>reset time: {remainingRateLimit.resetDate.toLocaleString()}</div>
        </Section>
      )}
      <Section title="your credentials">
        <label htmlFor="user[login]">Your github nickname:</label>
        <input
          id="user[login]"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        ></input>
        <label htmlFor="token">
          Your github access token <br /> (it will not be stored):
        </label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
        ></input>
      </Section>
      <Section onClick={() => push(ROOT)} className={cx(s.button, { [s.active]: path === ROOT })}>
        Subscribe
      </Section>
      <Section
        onClick={() => push(UNSUBSCRIBE)}
        className={cx(s.button, { [s.active]: path === UNSUBSCRIBE })}
      >
        Unsubscribe
      </Section>
      <Section
        onClick={() => push(FOLLOWERS)}
        className={cx(s.button, { [s.active]: path === FOLLOWERS })}
      >
        My Followers List
      </Section>
    </div>
  );
};

export default observer(Menu);
