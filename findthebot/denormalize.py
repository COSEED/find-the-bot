from app import Tweet, Tuser, tuser_schema, db

import json
import os
import sys

def run(tweet_ids):
    tweets = Tweet.query.filter(Tweet.tweet_id.in_(tweet_ids)).all()
    for tweet in tweets:
        tuser = Tuser.query.filter(Tuser.user_id == tweet.user_id).first()
        tuser_json = tuser_schema.dump(tuser)[0]
        tweet.user = json.dumps(tuser_json)
        db.session.add(tweet)
    db.session.commit()

tweet_ids = []

for line in sys.stdin:
    tweet_ids.append(int(line))
    if len(tweet_ids) == int(os.getenv('BATCH_SIZE')):
        run(tweet_ids)
        tweet_ids = []

run(tweet_ids)
