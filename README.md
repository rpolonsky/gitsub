This is a source of Github Subscriber web application

## The Idea

### Follow github users

You may use that web app to follow users on Github.

Just input some username (not yours) and get all user's connections.

Then with a single click follow them but don't forget to provide your username and token, otherwise, the API won't recognize you.

### Check your followers

You may load your followers list and track changes - who followed or unfollowed you.

The followers list is compared with the last snapshot.

Click the button `Save followers list` to make a snapshot - your current followers list will be saved to your local database (IndexedDB).

## Where to get the token

Go to https://github.com/settings/tokens/new and generate a new token.

Don't forget to select `user: follow` option - that permission is needed to make corresponding API calls.
