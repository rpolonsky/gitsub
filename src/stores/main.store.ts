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

const MOCK = [
  {
    login: 'topfunky',
    id: 26,
    node_id: 'MDQ6VXNlcjI2',
    avatar_url: 'https://avatars3.githubusercontent.com/u/26?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/topfunky',
    html_url: 'https://github.com/topfunky',
    followers_url: 'https://api.github.com/users/topfunky/followers',
    following_url: 'https://api.github.com/users/topfunky/following{/other_user}',
    gists_url: 'https://api.github.com/users/topfunky/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/topfunky/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/topfunky/subscriptions',
    organizations_url: 'https://api.github.com/users/topfunky/orgs',
    repos_url: 'https://api.github.com/users/topfunky/repos',
    events_url: 'https://api.github.com/users/topfunky/events{/privacy}',
    received_events_url: 'https://api.github.com/users/topfunky/received_events',
    type: 'User',
    site_admin: false,
  },
  {
    login: 'bleything',
    id: 270,
    node_id: 'MDQ6VXNlcjI3MA==',
    avatar_url: 'https://avatars1.githubusercontent.com/u/270?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/bleything',
    html_url: 'https://github.com/bleything',
    followers_url: 'https://api.github.com/users/bleything/followers',
    following_url: 'https://api.github.com/users/bleything/following{/other_user}',
    gists_url: 'https://api.github.com/users/bleything/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/bleything/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/bleything/subscriptions',
    organizations_url: 'https://api.github.com/users/bleything/orgs',
    repos_url: 'https://api.github.com/users/bleything/repos',
    events_url: 'https://api.github.com/users/bleything/events{/privacy}',
    received_events_url: 'https://api.github.com/users/bleything/received_events',
    type: 'User',
    site_admin: false,
  },
  {
    login: 'miles',
    id: 824,
    node_id: 'MDQ6VXNlcjgyNA==',
    avatar_url: 'https://avatars0.githubusercontent.com/u/824?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/miles',
    html_url: 'https://github.com/miles',
    followers_url: 'https://api.github.com/users/miles/followers',
    following_url: 'https://api.github.com/users/miles/following{/other_user}',
    gists_url: 'https://api.github.com/users/miles/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/miles/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/miles/subscriptions',
    organizations_url: 'https://api.github.com/users/miles/orgs',
    repos_url: 'https://api.github.com/users/miles/repos',
    events_url: 'https://api.github.com/users/miles/events{/privacy}',
    received_events_url: 'https://api.github.com/users/miles/received_events',
    type: 'User',
    site_admin: false,
  },
  {
    login: 'natacado',
    id: 846,
    node_id: 'MDQ6VXNlcjg0Ng==',
    avatar_url: 'https://avatars1.githubusercontent.com/u/846?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/natacado',
    html_url: 'https://github.com/natacado',
    followers_url: 'https://api.github.com/users/natacado/followers',
    following_url: 'https://api.github.com/users/natacado/following{/other_user}',
    gists_url: 'https://api.github.com/users/natacado/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/natacado/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/natacado/subscriptions',
    organizations_url: 'https://api.github.com/users/natacado/orgs',
    repos_url: 'https://api.github.com/users/natacado/repos',
    events_url: 'https://api.github.com/users/natacado/events{/privacy}',
    received_events_url: 'https://api.github.com/users/natacado/received_events',
    type: 'User',
    site_admin: false,
  },
  {
    login: 'tsmck22elvey',
    id: 1207,
    node_id: 'MDQ6VXNlcjEyMDc=',
    avatar_url: 'https://avatars2.githubusercontent.com/u/1207?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/tsmckelvey',
    html_url: 'https://github.com/tsmckelvey',
    followers_url: 'https://api.github.com/users/tsmckelvey/followers',
    following_url: 'https://api.github.com/users/tsmckelvey/following{/other_user}',
    gists_url: 'https://api.github.com/users/tsmckelvey/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/tsmckelvey/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/tsmckelvey/subscriptions',
    organizations_url: 'https://api.github.com/users/tsmckelvey/orgs',
    repos_url: 'https://api.github.com/users/tsmckelvey/repos',
    events_url: 'https://api.github.com/users/tsmckelvey/events{/privacy}',
    received_events_url: 'https://api.github.com/users/tsmckelvey/received_events',
    type: 'User',
    site_admin: false,
  },
  {
    login: 'tsmckelvey',
    id: 1207,
    node_id: 'MDQ6VXNlcjEyMDc=',
    avatar_url: 'https://avatars2.githubusercontent.com/u/1207?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/tsmckelvey',
    html_url: 'https://github.com/tsmckelvey',
    followers_url: 'https://api.github.com/users/tsmckelvey/followers',
    following_url: 'https://api.github.com/users/tsmckelvey/following{/other_user}',
    gists_url: 'https://api.github.com/users/tsmckelvey/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/tsmckelvey/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/tsmckelvey/subscriptions',
    organizations_url: 'https://api.github.com/users/tsmckelvey/orgs',
    repos_url: 'https://api.github.com/users/tsmckelvey/repos',
    events_url: 'https://api.github.com/users/tsmckelvey/events{/privacy}',
    received_events_url: 'https://api.github.com/users/tsmckelvey/received_events',
    type: 'User',
    site_admin: false,
  },
];
class MainStore implements Main {
  @observable following: any[] = MOCK;
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
