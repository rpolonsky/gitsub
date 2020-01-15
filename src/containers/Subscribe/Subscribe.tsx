/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import diffBy from 'lodash/differenceBy';
import { observer } from 'mobx-react';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';
import { useBaseStore } from '../../stores';
import { UserInfo } from '../../types';

import s from './Subscribe.module.css';

const Subscribe = () => {
  const [followList, setFollowList] = useState<UserInfo[]>([]);
  const [sourceUsername, setSourceUsername] = useState<string>('');
  const [minFollowings, setMinFollowings] = useState<string | number>(1);
  const {
    subscribe: {
      getUserFollowingList,
      resetFollowingList,
      followUsers,
      storedFollowedUsers,
      following,
      targets,
      currentTarget,
      loading,
      processing,
      page,
    },
    users,
    main: { username, token },
  } = useBaseStore();

  const readyToProcess = !!following.length && !loading && !processing;

  useEffect(() => {
    if (loading) {
      return;
    }
    setFollowList(following);
  }, [following, loading]);

  useEffect(() => {
    resetFollowingList();
    gtag('event', 'impression', { event_category: 'subscribe' });
  }, []);

  return (
    <>
      <Section title="user as source of connections">
        <label htmlFor="user[target]">User whose connections will be loaded:</label>
        <input
          id="user[target]"
          type="text"
          value={sourceUsername}
          placeholder="ex.: rpolonsky"
          onChange={e => setSourceUsername(e.target.value)}
          onKeyUp={e => {
            if (e.keyCode === 13) {
              getUserFollowingList(sourceUsername, username, token);
            }
          }}
          onFocus={() => gtag('event', 'user-input-focus', { event_category: 'subscribe' })}
        ></input>
        <br />
        <button
          onClick={() => {
            getUserFollowingList(sourceUsername, username, token);
            gtag('event', 'load-connections', {
              event_category: 'subscribe',
              event_label: sourceUsername,
            });
          }}
          disabled={loading || processing}
        >
          Load connections
        </button>
      </Section>

      {readyToProcess && (
        <Section title="some helpers for you">
          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(followList, username, token);
              /* uncheck users with less than 'minFollowings' followings */
              const extendedInfoItems = Object.values(users.extendedInfo);
              const noExtInfo = diffBy(followList, extendedInfoItems, user => user.login);
              const notMuchFollowing = extendedInfoItems.filter(
                user => user.following < minFollowings,
              );

              const list = diffBy(
                followList,
                [...noExtInfo, ...notMuchFollowing],
                user => user.login,
              );
              setFollowList(list);
            }}
            disabled={loading || users.loading}
          >
            Uncheck users who follows less than {minFollowings} users <br /> (caution: time
            consuming operation)
          </button>
          <div>
            <label htmlFor="minFollowings">Minimal number of followings:</label>
            <input
              id="minFollowings"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              className={s.minFollowingsInput}
              value={minFollowings}
              onChange={e => {
                const val = +e.target.value;
                setMinFollowings(val < 0 ? 0 : val);
              }}
            />
          </div>

          {users.loading && users.currentTarget && (
            <div>Loading extended info about {users.currentTarget.login}...</div>
          )}
        </Section>
      )}

      {processing && currentTarget && (
        <Section>
          <div>{targets.length} targets left</div>
          <div>Current target {currentTarget.login}</div>
        </Section>
      )}

      <Section title="list of connections">
        {!following.length && !loading && 'yet empty...'}
        {!!following.length && (
          <button
            onClick={() => {
              followUsers(followList, username, token);
              gtag('event', 'follow-users', { event_category: 'subscribe' });
            }}
            disabled={loading || processing}
          >
            Follow {followList.length} users
          </button>
        )}
        {loading && `Loading page #${page}...`}

        {following.map((user: UserInfo, index: number) => (
          <UserItem
            withCheckbox
            key={user.login}
            disabled={processing}
            followed={storedFollowedUsers.indexOf(user.login) !== -1}
            extended={users.extendedInfo[user.login]}
            user={user}
            checked={followList.findIndex(u => u.login === user.login) !== -1}
            onClick={() => {
              const currentIndex = followList.findIndex(u => u.login === user.login);
              const newFollowList = [...followList];

              if (currentIndex !== -1) {
                newFollowList.splice(currentIndex, 1);
              } else {
                newFollowList.splice(index, 0, user);
              }
              setFollowList(newFollowList);
            }}
          />
        ))}
      </Section>
    </>
  );
};

export default observer(Subscribe);
