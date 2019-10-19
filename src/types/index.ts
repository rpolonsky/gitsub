export type UserInfo = {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
};

export type UserExtendedInfo = UserInfo & {}

export type FollowersSnapshot = {
  date: Date;
  followers: UserInfo[];
};

export type FollowersDiff = {
  lost: UserInfo[];
  gained: UserInfo[];
  kept: UserInfo[];
};
