import { observable, action } from 'mobx';
import localforage from 'localforage';
import uniq from 'lodash/uniq';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo } from '../types';
import { sleepAsync } from '../utils';

interface Subscribe {
  storedFollowedUsers: string[];
  following: UserInfo[];
  targets: number;
  currentTargets: { [login: string]: boolean };
  page: number;
  loading: boolean;
  processing: boolean;
}

const MIN_TIMEOUT = 250;
const MAX_TIMEOUT = 500;
const MAX_SIMULTANEOUS_REQUESTS = 3;
const MAX_PAGE_LIMIT = 0;
const FOLLOWED_USERS_STORAGE_KEY = '_followedUsers';
const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class SubscribeStore implements Subscribe {
  private main: MainStore;

  @observable storedFollowedUsers: string[] = [];
  @observable following: UserInfo[] = [];
  @observable targets: number = 0;
  @observable currentTargets: { [login: string]: boolean } = {};
  @observable loading = false;
  @observable processing = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action getUserFollowingList = (
    targetUser: string,
    username: string,
    token: string,
    pageLimit = MAX_PAGE_LIMIT,
  ): Promise<UserInfo[]> =>
    new Promise((resolve, reject) => {
      this.loading = true;
      this.page = 1;
      this.following = [];

      const recursive = async () => {
        try {
          const result = await axios.get(
            GH_FOLLOWING_URL_TEMPLATE.replace('%USERNAME%', targetUser).replace(
              '%PAGE%',
              String(this.page),
            ),
            {
              auth: {
                username,
                password: token,
              },
            },
          );

          if (result?.data?.length) {
            this.following.push(...result.data);
          }

          this.main.setRemainingRateLimit(result.headers);

          if (result?.data?.length && (!pageLimit || this.page < pageLimit)) {
            this.page++;
            recursive();
          } else {
            this.loading = false;

            /* store user's own subscription list  */
            if (targetUser === username) {
              await this.storeFollowedUsers(
                this.following.map(u => u.login),
                targetUser,
              );
            }
            await this.loadStoredFollowedUsers(username);

            resolve(this.following);
          }
        } catch (error) {
          console.error('error', error);
          this.main.setError(error.message ?? error);
          this.following = [];
          this.loading = false;
          reject(error);
        }
      };

      recursive();
    });

  @action followUsers = (users: UserInfo[], username: string, token: string): Promise<string[]> =>
    new Promise(async (resolve, reject) => {
      const processed: string[] = [];
      const targets = [...users];
      this.targets = targets.length;

      if (!this.targets) {
        resolve(processed);
        return;
      }

      this.processing = true;

      const followUser = async (currentTarget: UserInfo) => {
        try {
          this.currentTargets[currentTarget.login] = true;
          const { headers } = await axios.put(
            GH_FOLLOW_URL_TEMPLATE.replace('%USERNAME%', currentTarget.login),
            {},
            {
              auth: {
                username,
                password: token,
              },
            },
          );
          processed.push(currentTarget.login);
          this.targets--;
          gtag('event', 'follow-user', {
            event_category: 'subscribe',
            event_value: currentTarget.login,
          });
          this.main.setRemainingRateLimit(headers);
          currentTarget.processed = true;
          this.currentTargets[currentTarget.login] = false;

          if (!this.targets) {
            this.storeFollowedUsers(
              targets.map(u => u.login),
              username,
            );
            this.processing = false;
            resolve(processed);
          }
        } catch (error) {
          console.error('error', error);
          this.main.setError(error.message ?? error);
          this.currentTargets[currentTarget.login] = false;
          reject(error);
        }
      };

      for (let i = 0; i < targets.length; i++) {
        const requestCount = Object.values(this.currentTargets).filter(i => i).length;
        const currentTarget = targets[i];
        followUser(currentTarget);
        await sleepAsync(requestCount >= MAX_SIMULTANEOUS_REQUESTS ? MAX_TIMEOUT : MIN_TIMEOUT);
      }
    });

  @action storeFollowedUsers = async (followedUsers: string[] | string, username: string) => {
    try {
      const key = username + FOLLOWED_USERS_STORAGE_KEY;
      const data: string[] = (await localforage.getItem(key)) || [];

      data.push(...(Array.isArray(followedUsers) ? followedUsers : [followedUsers]));

      await localforage.setItem(key, uniq(data));
      this.storedFollowedUsers = data;
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
    }
  };

  @action loadStoredFollowedUsers = async (username: string) => {
    this.storedFollowedUsers =
      (await localforage.getItem(username + FOLLOWED_USERS_STORAGE_KEY)) || [];
  };

  @action resetFollowingList = () => {
    this.following = [];
  };

  @action removeFromFollowingList = (logins: string[]) => {
    this.following = this.following.filter(user => !logins.includes(user.login));
  };
}

export default SubscribeStore;
