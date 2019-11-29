import { observable, action } from 'mobx';
import localforage from 'localforage';
import uniq from 'lodash/uniq';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo } from '../types';

interface Subscribe {
  storedFollowedUsers: string[];
  following: UserInfo[];
  targets: UserInfo[];
  currentTarget?: UserInfo;
  page: number;
  loading: boolean;
  processing: boolean;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const FOLLOWED_USERS_STORAGE_KEY = '_followedUsers';
const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class SubscribeStore implements Subscribe {
  private main: MainStore;

  @observable storedFollowedUsers: string[] = [];
  @observable following: UserInfo[] = [];
  @observable targets: UserInfo[] = [];
  @observable currentTarget?: UserInfo = undefined;
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
  ) => {
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
          setTimeout(() => recursive(), TIMEOUT);
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
        }
      } catch (error) {
        console.error('error', error);
        this.main.setError(error.message ?? error);
        this.following = [];
        this.loading = false;
      }
    };

    recursive();
  };
  @action followUsers = (users: UserInfo[], username: string, token: string) => {
    this.processing = true;
    this.targets = [...users];

    const recursive = async () => {
      try {
        this.currentTarget = this.targets.shift();

        if (!this.currentTarget) {
          return;
        }

        const { headers } = await axios.put(
          GH_FOLLOW_URL_TEMPLATE.replace('%USERNAME%', this.currentTarget.login),
          {},
          {
            auth: {
              username,
              password: token,
            },
          },
        );
        gtag('event', 'follow-user', {
          event_category: 'subscribe',
          event_value: this.currentTarget.login,
        });

        this.storeFollowedUsers(this.currentTarget.login, username);
        this.main.setRemainingRateLimit(headers);
        this.currentTarget.processed = true;

        if (this.targets.length) {
          setTimeout(() => {
            recursive();
          }, TIMEOUT);
        } else {
          this.processing = false;
        }
      } catch (error) {
        console.error('error', error);
        this.main.setError(error.message ?? error);
        this.processing = false;
      }
    };
    recursive();
  };

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
}

export default SubscribeStore;
