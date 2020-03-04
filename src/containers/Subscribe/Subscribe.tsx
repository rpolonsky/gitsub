/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import diffBy from 'lodash/differenceBy';
import { observer } from 'mobx-react';

import UserItem from '../../components/UserItem/UserItem';
import Section from '../../components/Section/Section';
import { useBaseStore } from '../../stores';
import { UserInfo } from '../../types';

import s from './Subscribe.module.css';
import { diffDays } from '../../utils';

const Subscribe = () => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [followList, setFollowList] = useState<UserInfo[]>([]);
  const [sourceUsername, setSourceUsername] = useState<string>('');
  const [minFollowings, setMinFollowings] = useState<number | string>(1);
  const [maxFollowers, setMaxFollowers] = useState<number | string>(0);
  const [lastVisitDays, setLastVisitDays] = useState<number | string>(4);
  const [coeffThreshold, setCoeffThreshold] = useState<string>('0.7');
  const {
    subscribe: {
      getUserFollowingList,
      resetFollowingList,
      followUsers,
      storedFollowedUsers,
      removeFromFollowingList,
      following,
      targets,
      currentTargets,
      loading,
      processing,
      page,
    },
    users,
    main: { username, token },
  } = useBaseStore();

  const readyToProcess = !!following.length && !loading && !processing;

  useEffect(() => {
    if (loading) {
      return;
    }
    setFollowList(following);
  }, [following.length, loading]);

  useEffect(() => {
    resetFollowingList();
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
          onChange={e => setSourceUsername(e.target.value.trim())}
          onKeyUp={e => {
            if (e.keyCode === 13) {
              getUserFollowingList(sourceUsername, username, token);
              gtag('event', 'load-connections', {
                event_category: 'subscribe',
                event_label: sourceUsername,
              });
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
          disabled={loading || processing}
        >
          Load connections
        </button>
      </Section>

      {readyToProcess && (
        <Section title="some helpers for you">
          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(followList, username, token);
              /* uncheck users with less than 'minFollowings' followings */
              const extendedInfoItems = Object.values(users.extendedInfo);
              const noExtInfo = diffBy(followList, extendedInfoItems, user => user.login);
              const notMuchFollowing = extendedInfoItems.filter(
                user => user.following < +minFollowings,
              );

              const list = diffBy(
                followList,
                [...noExtInfo, ...notMuchFollowing],
                user => user.login,
              );
              setFollowList(list);
            }}
            disabled={loading || users.loading}
          >
            Uncheck users who follows less than {+minFollowings} users
          </button>

          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(followList, username, token);
              /* uncheck users with more than 'maxFollowers' followers */
              const notMuchFollowed = followList.filter(user => {
                const extInfo = users.extendedInfo[user.login];
                if (!extInfo) {
                  return false;
                }

                return extInfo.followers <= +maxFollowers;
              });
              setFollowList(notMuchFollowed);
            }}
            disabled={loading || users.loading}
          >
            Uncheck users with more than {+maxFollowers} followers
          </button>

          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(followList, username, token);
              /* uncheck users with low ratio */
              const goodCoeffList = followList.filter(user => {
                const extInfo = users.extendedInfo[user.login];
                if (!extInfo) {
                  return false;
                }
                const { followers, following } = extInfo;
                return following / followers > parseFloat(coeffThreshold);
              });
              setFollowList(goodCoeffList);
            }}
            disabled={loading || users.loading}
          >
            Uncheck users with bad Following/Followed ratio
          </button>

          <button
            onClick={async () => {
              /* load/update extended user info */
              await users.getUsersExtendedInfo(followList, username, token);
              /* uncheck users recent visitors */
              const recentVisitors = followList.filter(user => {
                const extInfo = users.extendedInfo[user.login];
                if (!extInfo) {
                  return false;
                }

                return diffDays(new Date(), new Date(extInfo.updated_at)) <= +lastVisitDays;
              });
              setFollowList(recentVisitors);
            }}
            disabled={loading || users.loading}
          >
            Uncheck users who haven't visited github more than {+lastVisitDays} days
          </button>

          {!!storedFollowedUsers.length && (
            <button
              onClick={() => {
                setFollowList(followList.filter(user => !storedFollowedUsers.includes(user.login)));
              }}
              disabled={loading || users.loading}
            >
              Uncheck users who have already been followed
            </button>
          )}
          <button
            onClick={() => {
              setFollowList(following);
            }}
            disabled={loading || users.loading}
          >
            Check all
          </button>
          <button
            onClick={() => {
              setFollowList([]);
            }}
            disabled={loading || users.loading}
          >
            Uncheck all
          </button>
          <div>
            <label htmlFor="input">Minimal number of followings:</label>
            <input
              id="minFollowings"
              className={s.input}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minFollowings}
              onChange={e => {
                const val = e.target.value;
                setMinFollowings(+val < 0 && val !== '' ? 0 : val);
              }}
            />
          </div>
          <div>
            <label htmlFor="maxFollowers">Maximum number of followers:</label>
            <input
              id="maxFollowers"
              className={s.input}
              value={maxFollowers}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={e => {
                const val = e.target.value;
                setMaxFollowers(+val < 0 && val !== '' ? 0 : val);
              }}
            />
          </div>
          <div>
            <label htmlFor="coeffThreshold">Following/Followed coeff. threshold:</label>
            <input
              id="coeffThreshold"
              className={s.input}
              value={coeffThreshold}
              onChange={e => {
                const floatRegexp = /^[\d.]*$/;

                if (floatRegexp.test(e.target.value)) {
                  setCoeffThreshold(e.target.value);
                }
              }}
            />
          </div>
          <div>
            <label htmlFor="lastVisitDays">Days after the last visit:</label>
            <input
              id="lastVisitDays"
              className={s.input}
              value={lastVisitDays}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={e => {
                const val = e.target.value;
                setLastVisitDays(+val < 0 && val !== '' ? 0 : val);
              }}
            />
          </div>
        </Section>
      )}

      {processing && targets && (
        <Section>
          Following...
          <div>{targets} targets left</div>
        </Section>
      )}

      {users.loading && users.targets && (
        <Section>
          Getting additional information...
          <div>{users.targets} targets left</div>
        </Section>
      )}

      <Section title="list of connections">
        <button onClick={() => setIsHidden(!isHidden)} disabled={loading || processing}>
          {isHidden ? 'Show users list' : 'Hide users list'}
        </button>
        {!following.length && !loading && !isHidden && 'yet empty...'}
        {!!following.length && (
          <button
            onClick={async () => {
              gtag('event', 'follow-users', { event_category: 'subscribe' });
              const processed = await followUsers(followList, username, token);
              removeFromFollowingList(processed);
            }}
            disabled={loading || processing}
          >
            Follow {followList.length} users
          </button>
        )}
        {loading && `Loading page #${page}...`}

        {!isHidden &&
          following.map((user: UserInfo, index: number) => (
            <UserItem
              withCheckbox
              key={user.login}
              disabled={processing}
              followed={storedFollowedUsers.indexOf(user.login) !== -1}
              extended={users.extendedInfo[user.login]}
              pending={users.currentTargets[user.login] || currentTargets[user.login]}
              user={user}
              checked={followList.findIndex(u => u.login === user.login) !== -1}
              onClick={() => {
                const currentIndex = followList.findIndex(u => u.login === user.login);
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
