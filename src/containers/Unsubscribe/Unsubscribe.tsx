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
  const [unfollowList, setUnfollowList] = useState<any[]>([]);
  const [selectNotFollowers, setSelectNotFollowers] = useState<boolean>(false);
  const [selectNotMuchFollowed, setSelectNotMuchFollowed] = useState<boolean>(false);

  const {
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
    let unfollowList = [...subscribe.following];
    if (selectNotFollowers && followers.followers.length && !followers.loading) {
      unfollowList = differenceBy(
        subscribe.following,
        followers.followers,
        (user: UserInfo) => user.login,
      );
    }
    setUnfollowList(unfollowList);
  }, [subscribe.following.length, followers.followers.length, followers.loading]);

  /* load/update followers list */
  useEffect(() => {
    if (selectNotFollowers) {
      followers.getUserFollowersList(username, username, token);
    }
  }, [selectNotFollowers]);

  /* send impression event */
  useEffect(() => {
    gtag('event', 'impression', { event_category: 'unsubscribe' });
  }, []);

  return (
    <>
      {unsubscribe.processing && (
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
              subscribe.getUserFollowingList(username, username, token);
              gtag('event', 'load-my-connections', {
                event_category: 'unsubscribe',
                event_label: username,
              });
            }}
            disabled={subscribe.loading || noCredentials}
          >
            Load my connections
          </button>
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
            <label htmlFor="notFollowers">Select only users that don't follow me back</label>
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
            <label htmlFor="notMuchFollowed">Select users with less than 100 followers</label>
          </div>
          {followers.loading && (
            <div className={s.row}>Loading your followers (page #{followers.page})...</div>
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
        {subscribe.following.map((user: any, index: number) => (
          <UserItem
            withCheckbox
            key={user.login}
            user={user}
            checked={unfollowList.findIndex((u: any) => u.login === user.login) !== -1}
            onClick={() => {
              const currentIndex = unfollowList.findIndex((u: any) => u.login === user.login);
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
