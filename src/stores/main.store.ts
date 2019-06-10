import { observable, action } from 'mobx';

class Main {
  @observable users;
  @observable error;

  @action getUsers = () => {
    this.users = [{ name: 'test', nickname: 'test', image: 'test' }];
  };
}

export default Main;
