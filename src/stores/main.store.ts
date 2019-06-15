import { observable, action } from 'mobx';
import axios from 'axios';

interface Main {
  following: any[];
  error: string;
  loading: boolean;
  remainingRateLimit: string;
}

const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class MainStore implements Main {
  @observable following: any[] = [];
  @observable remainingRateLimit: string = 'unknown';
  @observable loading = false;
  @observable error = '';

  @action getUserFollowingList = async (targetUser: string, username: string, token: string) => {
    try {
      this.loading = true;
      let page = 1;
      const result = await axios.get(
        GH_FOLLOWING_URL_TEMPLATE.replace('%USERNAME%', targetUser).replace('%PAGE%', String(page)),
        {
          auth: {
            username,
            password: token,
          },
        },
      );

      console.log('result', result); /* TODO: Remove */

      this.following = result.data;
      this.remainingRateLimit = `${result.headers['x-ratelimit-remaining']} of ${
        result.headers['x-ratelimit-limit']
      } till ${new Date(result.headers['x-ratelimit-reset'] * 1000)}`;
    } catch (error) {
      console.log('error', error); /* TODO: Remove */
      this.error = error;
      this.following = [];
    }
    this.loading = false;
  };

  @action async followUsers(usernames: string[], username: string, token: string) {
    const { data } = await axios.put(
      GH_FOLLOW_URL_TEMPLATE.replace('%USERNAME%', usernames[0]),
      {},
      {
        auth: {
          username,
          password: token,
        },
      },
    );
    console.log('data', data); /* TODO: Remove */
  }
}

export default new MainStore();
