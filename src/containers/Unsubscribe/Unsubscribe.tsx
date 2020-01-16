/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import diffBy from 'lodash/differenceBy';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';

import { UserInfo } from '../../types';
import { useBaseStore } from '../../stores';

import s from './Unsubscribe.module.css';

const Unsubscribe = () => {
  const [unfollowList, setUnfollowList] = useState<UserInfo[]>([]);
  const [pageLimit, setPageLimit] = useState<string | number>('');
  const [minFollowers, setMinFollowers] = useState<string | number>(10000);

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
    if (subscribe.loading || !subscribe.following.length) {
      return;
    }
    setUnfollowList(subscribe.following);
  }, [subscribe.loading]);

  /* send impression event */
  useEffect(() => {
    subscribe.resetFollowingList();
    gtag('event', 'impression', { event_category: 'unsubscribe' });
  }, []);

  return (
    <>
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
              className={s.pageLimitInput}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageLimit}
              onChange={e => {
                const val = +e.target.value;
                setPageLimit(val < 0 ? 0 : val);
              }}
              onFocus={() => {
                gtag('event', 'pages-num-focus', { event_category: 'unsubscribe' });
              }}
            />
          </div>
        </div>
      </Section>
      {readyToProcess && (
        <Section title="some helpers for you">
          <button
            onClick={async () => {
              /* load/update followers list */
              await followers.getUserFollowersList(username, username, token);
              /* uncheck my followers */
              const newList = diffBy(unfollowList, followers.followers, user => user.login);
              setUnfollowList(newList);
            }}
            disabled={followers.loading || users.loading}
          >
            Uncheck my followers <br /> (will load your followers list)
          </button>
          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(unfollowList, username, token);
              /* uncheck users with more than 'minFollowers' followers */
              const extendedInfoItems = Object.values(users.extendedInfo);
              const noExtInfo = diffBy(unfollowList, extendedInfoItems, user => user.login);
              const muchFollowed = extendedInfoItems.filter(user => user.followers >= minFollowers);

              const list = diffBy(
                unfollowList,
                [...noExtInfo, ...muchFollowed],
                user => user.login,
              );
              setUnfollowList(list);
            }}
            disabled={followers.loading || users.loading}
          >
            Uncheck users with more than {minFollowers} followers <br /> (caution: time consuming
            operation)
          </button>
          <div>
            <label htmlFor="minFollowers">Minimal number of followers:</label>
            <input
              id="minFollowers"
              type="number"
              className={s.minFollowersInput}
              inputMode="numeric"
              pattern="[0-9]*"
              value={minFollowers}
              onChange={e => {
                const val = +e.target.value;
                setMinFollowers(val < 0 ? 0 : val);
              }}
            />
          </div>

          {followers.loading && (
            <div className={s.row}>Loading your followers (page #{followers.page})...</div>
          )}
        </Section>
      )}

      {unsubscribe.processing && unsubscribe.currentTarget && (
        <Section>
          <div>{unsubscribe.targets.length} targets left</div>
          <div>Current target {unsubscribe.currentTarget.login}</div>
        </Section>
      )}

      <Section title="list of users that you follow">
        {!!subscribe.following.length && (
          <button
            onClick={() => {
              unsubscribe.unfollowUsers(unfollowList, username, token);
              gtag('event', 'unfollow-users', { event_category: 'unsubscribe' });
            }}
            disabled={followers.loading || subscribe.loading || unsubscribe.processing}
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
            extended={users.extendedInfo[user.login]}
            pending={users.currentTargets[user.login]}
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
