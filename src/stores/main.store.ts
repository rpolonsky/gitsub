import { observable, action } from 'mobx';
import axios from 'axios';

type RateLimit = {
  limit: string;
  remaining: string;
  resetDate: Date;
};

interface Main {
  isMenuOpen: boolean;
  following: any[];
  targets: any[];
  currentTarget: any;
  page: number;
  error: string;
  loading: boolean;
  processing: boolean;
  remainingRateLimit?: RateLimit;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

const getRateLimit = (headers: { [key: string]: string }): RateLimit => ({
  limit: headers['x-ratelimit-limit'],
  remaining: headers['x-ratelimit-remaining'],
  resetDate: new Date(+headers['x-ratelimit-reset'] * 1000),
});

class MainStore implements Main {
  @observable following: any[] = [];
  @observable targets: any[] = [];
  @observable currentTarget: any = null;
  @observable remainingRateLimit: RateLimit | undefined;
  @observable loading = false;
  @observable processing = false;
  @observable page = 1;
  @observable error = '';
  @observable isMenuOpen = false;

  @action resetError = () => {
    this.error = '';
  };
  @action toggleMenuState = () => {
    this.isMenuOpen = !this.isMenuOpen;
  };
  @action setMenuState = (state: boolean) => {
    this.isMenuOpen = state;
  };
  @action getUserFollowingList = (targetUser: string, username: string, token: string) => {
    try {
      this.loading = true;
      this.page = 1;
      this.following = [];

      const recursive = async () => {
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

        this.remainingRateLimit = getRateLimit(result.headers);

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
      this.error = error.message ?? error;
      this.following = [];
      this.loading = false;
    }
  };
  @action followUsers = (users: any[], username: string, token: string) => {
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

        this.remainingRateLimit = getRateLimit(headers);
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
        this.error = error.message ?? error;
        this.processing = false;
      }
    };
    recursive();
  };
}

export default new MainStore();
