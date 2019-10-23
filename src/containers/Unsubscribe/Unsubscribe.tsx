/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import differenceBy from 'lodash/differenceBy';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';

import { UserInfo } from '../../types';
import { useBaseStore } from '../../stores';

import s from './Unsubscribe.module.css';

const Unsubscribe = () => {
  const [unfollowList, setUnfollowList] = useState<UserInfo[]>([]);
  const [pageLimit, setPageLimit] = useState<string>('');
  const [selectNotFollowers, setSelectNotFollowers] = useState<boolean>(false);
  const [selectNotMuchFollowed, setSelectNotMuchFollowed] = useState<boolean>(false);

  const {
    users,
    unsubscribe,
    followers,
    subscribe,
    main: { username, token },
  } = useBaseStore();

  const noCredentials = !username || !token;
  const readyToProcess =
    !!subscribe.following.length && !subscribe.loading && !unsubscribe.processing;

  /* update local list of users to unfollow */
  useEffect(() => {
    if (followers.loading) {
      return;
    }
    let newList = [...subscribe.following];

    if (selectNotFollowers && followers.followers.length && !followers.loading) {
      newList = differenceBy(newList, followers.followers, user => user.login);
    }

    if (selectNotMuchFollowed && users.userInfoExtended.length && !users.loading) {
      const noExtInfo = differenceBy(newList, users.userInfoExtended, user => user.login);
      const muchFollowed = users.userInfoExtended.filter(user => user.followers >= 100);

      newList = differenceBy(newList, [...noExtInfo, ...muchFollowed], user => user.login);
    }

    setUnfollowList(newList);
  }, [
    subscribe.following.length,
    followers.followers.length,
    users.userInfoExtended.length,
    followers.loading,
  ]);

  /* load/update followers list */
  useEffect(() => {
    if (selectNotFollowers) {
      followers.getUserFollowersList(username, username, token);
    }
  }, [selectNotFollowers]);

  /* load/update extended user info */
  useEffect(() => {
    if (selectNotMuchFollowed) {
      users.getUsersExtendedInfo(subscribe.following, username, token);
    }
  }, [selectNotMuchFollowed]);

  /* send impression event */
  useEffect(() => {
    gtag('event', 'impression', { event_category: 'unsubscribe' });
  }, []);

  return (
    <>
      {unsubscribe.processing && unsubscribe.currentTarget && (
        <Section>
          <div>{unsubscribe.targets.length} targets left</div>
          <div>Current target {unsubscribe.currentTarget.login}</div>
        </Section>
      )}
      <Section>
        {noCredentials ? (
          <>
            <div>You have not provided your nickname and token</div>
            <div className={s.row}>Please pay attention to [your credentials] form</div>
          </>
        ) : (
          <>You're all set to load your list of followed users</>
        )}
        <div className={s.row}>
          <button
            onClick={() => {
              setUnfollowList([]);
              subscribe.getUserFollowingList(username, username, token, +pageLimit);
              gtag('event', 'load-my-connections', {
                event_category: 'unsubscribe',
                event_label: username,
              });
            }}
            disabled={subscribe.loading || noCredentials}
          >
            {pageLimit ? `Load ${pageLimit} pages` : 'Load all my connections'}
          </button>
          <div className={s.inputCol}>
            <label htmlFor="pageLimit">Number of pages:</label>
            <input
              id="pageLimit"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageLimit}
              onChange={e => {
                setPageLimit(e.target.value);
              }}
              onFocus={() => {
                gtag('event', 'pages-num-focus', { event_category: 'unsubscribe' });
              }}
            ></input>
          </div>
        </div>
      </Section>
      {readyToProcess && (
        <Section title="some selection helpers for you">
          <div>
            <input
              type="checkbox"
              id="notFollowers"
              onChange={(e: any) => {
                setSelectNotFollowers(e.target.checked);
              }}
              checked={selectNotFollowers}
              disabled={followers.loading}
            />
            <label htmlFor="notFollowers">
              Select only users that don't follow me back (will load your followers list)
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id="notMuchFollowed"
              onChange={(e: any) => {
                setSelectNotMuchFollowed(e.target.checked);
              }}
              checked={selectNotMuchFollowed}
              disabled={followers.loading}
            />
            <label htmlFor="notMuchFollowed">
              Select users with less than 100 followers (caution: time consuming operation)
            </label>
          </div>
          {followers.loading && (
            <div className={s.row}>Loading your followers (page #{followers.page})...</div>
          )}
          {users.loading && users.currentTarget && (
            <div className={s.row}>Loading extended info about {users.currentTarget.login}...</div>
          )}
        </Section>
      )}
      <Section title="list of users that you follow">
        {!!subscribe.following.length && (
          <button
            onClick={() => {
              unsubscribe.unfollowUsers(unfollowList, username, token);
              gtag('event', 'unfollow-users', { event_category: 'unsubscribe' });
            }}
            disabled={followers.loading || subscribe.loading}
          >
            {subscribe.loading
              ? `Loading page #${subscribe.page}...`
              : `Unfollow ${unfollowList.length} selected users`}
          </button>
        )}
        {!subscribe.following.length && !subscribe.loading && 'yet empty...'}
        {subscribe.following.map((user: UserInfo, index: number) => (
          <UserItem
            withCheckbox
            key={user.login}
            user={user}
            checked={unfollowList.findIndex(u => u.login === user.login) !== -1}
            onClick={() => {
              const currentIndex = unfollowList.findIndex(u => u.login === user.login);
              const newFollowList = [...unfollowList];

              if (currentIndex !== -1) {
                newFollowList.splice(currentIndex, 1);
              } else {
                newFollowList.splice(index, 0, user);
              }
              setUnfollowList(newFollowList);
            }}
          />
        ))}
      </Section>
    </>
  );
};

export default observer(Unsubscribe);
