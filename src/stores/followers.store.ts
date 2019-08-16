import { observable, action } from 'mobx';
import axios from 'axios';
import diff from 'lodash/differenceBy';
import intersect from 'lodash/intersectionBy';
import localforage from 'localforage';

import { UserInfo, FollowersDiff, FollowersSnapshot } from '../types';
import MainStore from './main.store';

const FOLLOWERS_MOCK = [
  {
    login: 'testLogin',
    id: 7777777,
    node_id: '121212121212=',
    avatar_url: 'https://avatars1.githubusercontent.com/u/7777777?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/testLogin',
    html_url: 'https://github.com/testLogin',
    followers_url: 'https://api.github.com/users/testLogin/followers',
    following_url: 'https://api.github.com/users/testLogin/following{/other_user}',
    gists_url: 'https://api.github.com/users/testLogin/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/testLogin/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/testLogin/subscriptions',
    organizations_url: 'https://api.github.com/users/testLogin/orgs',
    repos_url: 'https://api.github.com/users/testLogin/repos',
    events_url: 'https://api.github.com/users/testLogin/events{/privacy}',
    received_events_url: 'https://api.github.com/users/testLogin/received_events',
    type: 'User',
    site_admin: false,
  },
];
interface Followers {
  followers: UserInfo[];
  page: number;
  loading: boolean;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWERS_URL_TEMPLATE = '/api/gh/users/%USERNAME%/followers?page=%PAGE%';

class FollowersStore implements Followers {
  private main: MainStore;

  @observable followers: UserInfo[] = FOLLOWERS_MOCK;
  @observable loading = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action getUserFollowersList = (targetUser: string, username: string, token: string) => {
    try {
      this.loading = true;
      this.page = 1;
      this.followers = [];

      const recursive = async () => {
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
      };

      recursive();
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      this.followers = [];
      this.loading = false;
    }
  };

  @action saveFollowersList = async (username: string) => {
    const key = `followers_${username}`;

    let dataToStore = await this.getStoredFollowersList(username);
    dataToStore.push({ date: new Date(), followers: this.followers });

    await localforage.setItem(key, JSON.stringify(dataToStore));
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
      kept: intersect(this.followers, prevFollowers),
    };
  };

  @action getStoredFollowersList = async (username: string): Promise<FollowersSnapshot[]> => {
    const key = `followers_${username}`;
    const storedDataString: string = await localforage.getItem(key);

    return storedDataString ? JSON.parse(storedDataString) : [];
  };
}

export default FollowersStore;
