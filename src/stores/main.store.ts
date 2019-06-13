import { observable, action } from 'mobx';

interface Main {
  users: any[];
  error: string;
}

class MainStore implements Main {
  @observable users: any[] = [];
  @observable error = '';

  @action getUsers = () => {
    this.users = [{ name: 'test', nickname: 'test', image: 'test' }];
  };
}

export default new MainStore();
