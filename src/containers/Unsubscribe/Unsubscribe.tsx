/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import diffBy from 'lodash/differenceBy';
import { Helmet } from 'react-helmet';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';

import { UserInfo } from '../../types';
import { useBaseStore } from '../../stores';

import s from './Unsubscribe.module.css';

const Unsubscribe = () => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
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

  /* send impression event */
  useEffect(() => {
    subscribe.resetFollowingList();
    gtag('event', 'impression', { event_category: 'unsubscribe' });
  }, []);

  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="GitHub Subscriber is the best open-source application that helps you to manage your followed GitHub users for free! Auto Follow & Unfollow, Check changes since last visit!"
        />
        <title>
          GitHub Subscriber - Unfollow GitHub users from your following list automatically
        </title>
      </Helmet>
      <Section>
        {noCredentials ? (
          <>
            <div>You have not provided your nickname and token</div>
            <div className={s.row}>Please pay attention to [your credentials] form</div>
          </>
        ) : (
          <>Ready to load your list of followed users</>
        )}
        <div className={s.row}>
          <button
            onClick={async () => {
              setUnfollowList([]);
              gtag('event', 'load-my-connections', {
                event_category: 'unsubscribe',
                event_label: username,
              });
              await subscribe.getUserFollowingList(username, username, token, +pageLimit);
              /* update local list of users to unfollow */
              setUnfollowList(subscribe.following);
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
              const muchFollowed = extendedInfoItems.filter(
                user => user.followers >= +minFollowers,
              );

              const list = diffBy(
                unfollowList,
                [...noExtInfo, ...muchFollowed],
                user => user.login,
              );
              setUnfollowList(list);
            }}
            disabled={followers.loading || users.loading}
          >
            Uncheck users with more than {+minFollowers} followers
          </button>
          <button
            onClick={() => {
              setUnfollowList(subscribe.following);
            }}
            disabled={followers.loading || users.loading}
          >
            Check all
          </button>
          <button
            onClick={() => {
              setUnfollowList([]);
            }}
            disabled={followers.loading || users.loading}
          >
            Uncheck all
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
                const val = e.target.value;
                setMinFollowers(+val < 0 && val !== '' ? 0 : val);
              }}
            />
          </div>

          {followers.loading && (
            <div className={s.row}>Loading your followers (page #{followers.page})...</div>
          )}
        </Section>
      )}

      {unsubscribe.processing && unsubscribe.targets && (
        <Section>
          Unfollowing...
          <div>{unsubscribe.targets} targets left</div>
        </Section>
      )}

      {users.loading && users.targets && (
        <Section>
          Getting additional information...
          <div>{users.targets} targets left</div>
        </Section>
      )}

      <Section title="list of users that you follow">
        <button onClick={() => setIsHidden(!isHidden)}>
          {isHidden ? 'Show users list' : 'Hide users list'}
        </button>
        {!!subscribe.following.length && (
          <button
            onClick={async () => {
              gtag('event', 'unfollow-users', { event_category: 'unsubscribe' });
              const processed = await unsubscribe.unfollowUsers(unfollowList, username, token);
              subscribe.removeFromFollowingList(processed);
            }}
            disabled={followers.loading || subscribe.loading || unsubscribe.processing}
          >
            {subscribe.loading
              ? `Loading page #${subscribe.page}...`
              : `Unfollow ${unfollowList.length} selected users`}
          </button>
        )}
        {!subscribe.following.length && !subscribe.loading && !isHidden && 'yet empty...'}
        {!isHidden && subscribe.following.map((user: UserInfo, index: number) => (
          <UserItem
            withCheckbox
            key={user.login}
            user={user}
            disabled={followers.loading || subscribe.loading || unsubscribe.processing}
            extended={users.extendedInfo[user.login]}
            pending={users.currentTargets[user.login] || unsubscribe.currentTargets[user.login]}
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
