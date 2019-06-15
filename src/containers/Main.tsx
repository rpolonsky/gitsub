import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './main.css';

const Main = () => {
  const [followList, setFollowList] = useState<any[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const {
    main: { getUserFollowingList, followUsers, following, loading, remainingRateLimit },
  } = useBaseStore();

  useEffect(() => {
    setFollowList(following);
  }, [following]);

  return (
    <div>
      <div className="section">
        <div className="col">
          Remaining rate limit: {remainingRateLimit}
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}></input>
          <input type="text" value={token} onChange={e => setToken(e.target.value)}></input>
        </div>
      </div>
      <div className="section">
        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}></input>
        <button
          onClick={() => {
            getUserFollowingList(nickname, username, token);
          }}
          disabled={loading}
        >
          Start
        </button>
      </div>
      <div className="section col">
        {!!following.length && (
          <button
            onClick={() => {
              followUsers(followList, username, token);
            }}
          >
            Follow {followList.length} users
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
        {loading && 'Loading...'}
      </div>
    </div>
  );
};

export default observer(Main);
