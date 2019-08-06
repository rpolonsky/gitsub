import { observable, action } from 'mobx';
import axios from 'axios';

import MainStore from './main.store';

interface Followers {
  followers: any[];
  page: number;
  loading: boolean;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWERS_URL_TEMPLATE = '/api/gh/users/%USERNAME%/followers?page=%PAGE%';

class FollowersStore implements Followers {
  private main: MainStore;

  @observable followers: any[] = [];
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
}

export default FollowersStore;
