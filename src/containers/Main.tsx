import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './Main.css';

const Main = () => {
  const [followList, setFollowList] = useState<any[]>([]);
  const [nickname, setNickname] = useState<string>('');
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
      <div className="section">
        <div className="col">
          Remaining rate limit: {remainingRateLimit}
          <br />
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
        <div className="col">
          <label htmlFor="user[target]">Input username which connections will be parsed:</label>
          <div>
            <input
              id="user[target]"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            ></input>
            <button
              onClick={() => {
                getUserFollowingList(nickname, username, token);
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
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            key={user.login}
            className="item"
          >
            <input
              type="checkbox"
              name={user.login}
              onChange={e => {
                const currentIndex = followList.findIndex((u: any) => u.login === e.target.name);
                const newFollowList = [...followList];

                if (currentIndex !== -1) {
                  newFollowList.splice(currentIndex, 1);
                } else {
                  newFollowList.splice(index, 0, user);
                }
                setFollowList(newFollowList);
              }}
              checked={followList.findIndex((u: any) => u.login === user.login) !== -1}
            />
            <img width={50} height={50} src={user.avatar_url} alt={user.login} />
            <div>{user.login}</div>
            <div>{user.processed && 'processed'}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default observer(Main);
