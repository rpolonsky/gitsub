import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation, useHistory } from 'react-router-dom';
import cx from 'classnames';

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
      <Section onClick={() => push('/')} className={cx(s.button, { [s.active]: path === '/' })}>
        Subscribe
      </Section>
      <Section
        onClick={() => push('/unsubscribe')}
        className={cx(s.button, { [s.active]: path === '/unsubscribe' })}
      >
        Unsubscribe
      </Section>
      <Section
        onClick={() => push('/followers')}
        className={cx(s.button, { [s.active]: path === '/followers' })}
      >
        My Followers List
      </Section>
    </div>
  );
};

export default observer(Menu);
