/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

import Section from '../../components/Section/Section';
import UserItem from '../../components/UserItem/UserItem';

import { useBaseStore } from '../../stores';
import { FollowersDiff } from '../../types';

import s from './Followers.module.css';

const Followers = () => {
  const {
    main: { username, token },
    followers: {
      followers,
      loading,
      getUserFollowersList,
      saveFollowersList,
      cleanFollowersList,
      getFollowersListDiff,
    },
  } = useBaseStore();

  const [targetUsername, setTargetUsername] = useState<string>(username);
  const [followersDiff, setFollowersDiff] = useState<FollowersDiff | null>(null);

  useEffect(() => {
    setTargetUsername(username);
    cleanFollowersList();
  }, [username]);

  useEffect(() => {
    (async () => setFollowersDiff(await getFollowersListDiff(targetUsername)))();
  }, [followers]);

  console.log('followersDiff', followersDiff); // TODO Remove
  
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
        <button onClick={() => saveFollowersList(username)}>Save followers list snapshot</button>
      </Section>

      <Section title={`list of ${followers.length || ''} followers`}>
        {!followers.length && !loading && 'yet empty...'}

        {followers.map((user: any, index: number) => (
          <UserItem key={user.login} user={user} className={s.followerItem} />
        ))}
      </Section>
    </>
  );
};

export default observer(Followers);
