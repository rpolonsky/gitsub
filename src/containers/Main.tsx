import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';
import cx from 'classnames';

import './Main.css';

const UserItem = ({ user, onClick, checked }: any) => {
  return (
    <div className={cx('item', { unselected: !checked })} onClick={onClick}>
      <input type="checkbox" name={user.login} onChange={onClick} checked={checked} />
      <img src={user.avatar_url} alt={user.login} />
      <div className="name">
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
      remainingRateLimit,
      page,
    },
  } = useBaseStore();

  useEffect(() => {
    setFollowList(following);
  }, [following]);

  return (
    <div>
      {!!remainingRateLimit && (
        <div className="section col">
          <div className="sectionTitle">rate limits</div>
          <div>
            available: {remainingRateLimit.remaining} out of {remainingRateLimit.limit} requests
          </div>
          <div>reset time: {remainingRateLimit.resetDate.toLocaleString()}</div>
        </div>
      )}
      <div className="section">
        <div className="sectionTitle">your credentials</div>
        <div className="col">
          <label htmlFor="user[login]">Input your github nickname:</label>
          <input
            id="user[login]"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          ></input>
          <label htmlFor="token">Input your github access token (it will not be stored):</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
          ></input>
        </div>
      </div>
      <div className="section">
        <div className="sectionTitle">another user name as source of connections</div>
        <div className="col">
          <label htmlFor="user[target]">Input username which connections will be loaded:</label>
          <div className="col">
            <input
              id="user[target]"
              type="text"
              value={sourceUsername}
              placeholder="ex.: rpolonsky"
              onChange={e => setSourceUsername(e.target.value)}
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
          </div>
        </div>
      </div>
      {processing && (
        <div className="section col">
          <div>{targets.length} targets left</div>
          <div>Current target {currentTarget.login}</div>
        </div>
      )}
      <div className="section col">
        <div className="sectionTitle">
          {!!sourceUsername.length && `${sourceUsername}'s `}list of connections
        </div>
        {!following.length && !loading && 'empty yet...'}
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
      </div>
    </div>
  );
};

export default observer(Main);
