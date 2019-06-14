import { observable, action } from 'mobx';
import axios from 'axios';

interface Main {
  following: any[];
  error: string;
  loading: boolean;
}

const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';

class MainStore implements Main {
  @observable following: any[] = [];
  @observable loading = false;
  @observable error = '';

  @action getUserFollowingList = async (username: string) => {
    try {
      this.loading = true;
      let page = 1;
      const { data } = await axios.get(
        GH_FOLLOWING_URL_TEMPLATE.replace('%USERNAME%', username).replace('%PAGE%', String(page)),
      );
      
      this.following = data;
    } catch (error) {
      console.log('error', error); /* TODO: Remove */
      this.error = error;
      this.following = [];
    }
    this.loading = false;
  };
}

export default new MainStore();
