import cx from 'classnames';
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

import Section from '../../components/Section/Section';
import { useBaseStore } from '../../stores';

import s from './Main.module.css';

const UserItem = ({ user, onClick, checked }: any) => {
  return (
    <div className={cx(s.item, { unselected: !checked })} onClick={onClick}>
      <input type="checkbox" name={user.login} onChange={onClick} checked={checked} />
      <img src={user.avatar_url} alt={user.login} />
      <div className={s.name}>
        <a
          href={`https://github.com/${user.login}`}
          onClick={e => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {user.login}
        </a>
      </div>
      {user.processed && 'processed'}
    </div>
  );
};

const Main = () => {
  const [followList, setFollowList] = useState<any[]>([]);
  const [sourceUsername, setSourceUsername] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const {
    main: {
      getUserFollowingList,
      followUsers,
      following,
      targets,
      currentTarget,
      loading,
      processing,
      page,
    },
  } = useBaseStore();

  useEffect(() => {
    setFollowList(following);
  }, [following]);

  return (
    <>
      <Section title="user as source of connections">
        <label htmlFor="user[target]">User which connections will be loaded:</label>
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
        ></input>
        <br />
        <button
          onClick={() => {
            getUserFollowingList(sourceUsername, username, token);
          }}
          disabled={loading}
        >
          Start
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
            }}
          >
            {loading ? `Loading page #${page}...` : `Follow ${followList.length} users`}
          </button>
        )}

        {following.map((user: any, index) => (
          <UserItem
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

export default observer(Main);
