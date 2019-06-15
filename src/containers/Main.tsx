import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './main.css';

const Main = () => {
  const [nickname, setNickname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const {
    main: { getUserFollowingList, followUsers, following, loading, remainingRateLimit },
  } = useBaseStore();

  return (
    <div>
      <div className="section">
        <div className="col">
          Remaining rate limit: {remainingRateLimit}
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}></input>
          <input type="text" value={token} onChange={e => setToken(e.target.value)}></input>
        </div>
      </div>
      {loading ? (
        'Loading...'
      ) : (
        <div className="section">
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}></input>
          <button
            onClick={() => {
              getUserFollowingList(nickname, username, token);
            }}
          >
            Start
          </button>
          {!!following.length && (
            <button
              onClick={() => {
                followUsers([following[5].login], username, token);
              }}
            >
              Follow {following[5].login}
            </button>
          )}
        </div>
      )}
      <div className="section col">
        {following.map((user: any) => (
          <a href={user.followers_url} key={user.login} className="item">
            <img width={50} height={50} src={user.avatar_url} alt={user.login} />
            <div>Type: {user.type}</div>
            <div>Name: {user.login}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default observer(Main);
