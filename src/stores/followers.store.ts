import { observable, action } from 'mobx';
import axios from 'axios';
import diff from 'lodash/differenceBy';
import intersect from 'lodash/intersectionBy';
import localforage from 'localforage';

import { UserInfo, FollowersDiff, FollowersSnapshot } from '../types';
import MainStore from './main.store';

interface Followers {
  followers: UserInfo[];
  page: number;
  loading: boolean;
  saving: boolean;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWERS_URL_TEMPLATE = '/api/gh/users/%USERNAME%/followers?page=%PAGE%';

class FollowersStore implements Followers {
  private main: MainStore;

  @observable followers: UserInfo[] = [];
  @observable loading = false;
  @observable saving = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action getUserFollowersList = (targetUser: string, username: string, token: string) => {
    this.loading = true;
    this.page = 1;
    this.followers = [];

    const recursive = async () => {
      try {
        const result = await axios.get(
          GH_FOLLOWERS_URL_TEMPLATE.replace('%USERNAME%', targetUser).replace(
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
          this.followers.push(...result.data);
          this.followers = this.followers.slice().reverse();
        }

        this.main.setRemainingRateLimit(result.headers);

        if (result?.data?.length && (!MAX_PAGE_LIMIT || this.page < MAX_PAGE_LIMIT)) {
          this.page++;
          setTimeout(() => recursive(), TIMEOUT);
        } else {
          this.loading = false;
        }
      } catch (error) {
        console.error('error', error);
        this.main.setError(error.message ?? error);
        this.followers = [];
        this.loading = false;
      }
    };

    recursive();
  };

  @action storeFollowersList = async (username: string) => {
    try {
      this.saving = true;
      const key = `followers_${username}`;

      let dataToStore = await this.getStoredFollowersList(username);
      dataToStore.push({ date: new Date(), followers: this.followers });

      await localforage.setItem(key, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
    } finally {
      this.saving = false;
    }
  };

  @action cleanFollowersList = () => {
    this.followers = [];
  };

  @action getFollowersListDiff = async (
    username: string,
    index?: number,
  ): Promise<FollowersDiff | null> => {
    if (!username.length) {
      return null;
    }

    const storedData = await this.getStoredFollowersList(username);

    if (!storedData.length || (index && index >= storedData.length)) {
      return null;
    }

    const prevFollowers = index
      ? storedData[index].followers
      : (storedData.pop() as FollowersSnapshot).followers;

    return {
      lost: diff(prevFollowers, this.followers, i => i.id),
      gained: diff(this.followers, prevFollowers, i => i.id),
      kept: intersect(this.followers, prevFollowers, i => i.id),
    };
  };

  @action getStoredFollowersList = async (username: string): Promise<FollowersSnapshot[]> => {
    const key = `followers_${username}`;
    const storedDataString: string = await localforage.getItem(key);

    return storedDataString ? JSON.parse(storedDataString) : [];
  };
}

export default FollowersStore;
