import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

import Section from '../../components/Section/Section';
import UserItem from '../../components/UserItem/UserItem';

import { useBaseStore } from '../../stores';

import s from './Followers.module.css';

const Followers = () => {
  const {
    main: { username, token },
    followers: { followers, loading, getUserFollowersList },
  } = useBaseStore();

  const [targetUsername, setTargetUsername] = useState<string>(username);

  useEffect(() => {
    setTargetUsername(username);
  }, [username]);

  return (
    <>
      <Section title="whose followers to load">
        <label htmlFor="user[target]">User whose followers will be loaded:</label>
        <input
          id="user[target]"
          type="text"
          value={targetUsername}
          placeholder="ex.: rpolonsky"
          onChange={e => setTargetUsername(e.target.value)}
          onKeyUp={e => {
            if (e.keyCode === 13) {
              getUserFollowersList(targetUsername, username, token);
            }
          }}
        ></input>
        <br />
        <button
          onClick={() => {
            getUserFollowersList(targetUsername, username, token);
          }}
          disabled={loading}
        >
          Load followers
        </button>
      </Section>

      <Section title="list of followers">
        {!followers.length && !loading && 'yet empty...'}

        {followers.map((user: any, index: number) => (
          <UserItem key={user.login} user={user} />
        ))}
      </Section>
    </>
  );
};

export default observer(Followers);
