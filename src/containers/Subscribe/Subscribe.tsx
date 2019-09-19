import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';
import { useBaseStore } from '../../stores';

const Subscribe = () => {
  const [followList, setFollowList] = useState<any[]>([]);
  const [sourceUsername, setSourceUsername] = useState<string>('');
  const {
    subscribe: {
      getUserFollowingList,
      followUsers,
      following,
      targets,
      currentTarget,
      loading,
      processing,
      page,
    },
    main: { username, token },
  } = useBaseStore();

  useEffect(() => {
    setFollowList(following);
  }, [following]);

  useEffect(() => {
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
          disabled={loading}
        >
          Load connections
        </button>
      </Section>
      {processing && (
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
          >
            {loading ? `Loading page #${page}...` : `Follow ${followList.length} users`}
          </button>
        )}

        {following.map((user: any, index: number) => (
          <UserItem
            withCheckbox
            key={user.login}
            user={user}
            checked={followList.findIndex((u: any) => u.login === user.login) !== -1}
            onClick={() => {
              const currentIndex = followList.findIndex((u: any) => u.login === user.login);
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
