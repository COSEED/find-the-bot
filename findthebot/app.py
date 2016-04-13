import os
import time

import logging

from functools import wraps

from flask import Flask, redirect, render_template, request, Response
from flask.ext.sqlalchemy import SQLAlchemy
from flask.json import jsonify

from sqlalchemy import func 

import psycopg2

app = Flask(__name__)

debug = os.getenv('DEBUG') is not None

if os.getenv('DATABASE_URL') is None:
    raise ValueError('Missing DATABASE_URL')

if os.getenv('PASSWORD') is None:
    raise ValueError('Missing PASSWORD')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_ECHO'] = debug

def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    return password == os.getenv('PASSWORD')

def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

db = SQLAlchemy(app)

DIFFICULTY_EASY = 'easy'
DIFFICULTY_MEDIUM = 'medium'
DIFFICULTY_HARD = 'hard'

# 2/5 bots
USERS_HARD = [
    5591048,
    5591049,
    5591050,

    5588759, # Fenvirantiviral
    5582774, # Random 1
    5586448, # SarahAndFam
    5586871, # Random 2
    5582960  # Random 3
]

# 4/5 bots
USERS_EASY = [
    5591042, # gzf68920 (bot)
    5591043, # gzf68920 (bot)
    5591044, # gzf68920 (bot)

    5584555, # sonny_mkii (bot)
    4823361, # Daryl_V1 (bot)
    4817289, # HectorBigs (bot)
    4822353, # robo_ash (bot)
    5582689  # CoryBooker, U.S. Senator from New Jersey (Not)
]

# 3/5 bots
USERS_MEDIUM = [
    5591045,
    5591046,
    5591047,

    5590373, # cleanlivingmama (bot)
    5589464, # TannersDad (Not)
    5579275, # nursekayci (bot)
    5585284, # Peter_Pete_Pete (bot)
    5589488, # yokoono (Not)
]

USERS = {
    DIFFICULTY_EASY: USERS_EASY,
    DIFFICULTY_MEDIUM: USERS_MEDIUM,
    DIFFICULTY_HARD: USERS_HARD
}

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    selections = db.relationship('TestSelection', lazy='joined')
    guesses = db.relationship('TestGuess', lazy='joined')

class TestSelection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'))
    tuser_id = db.Column(db.BigInteger, db.ForeignKey('tuser.id'))
    order = db.Column(db.Integer)

    tuser = db.relationship('Tuser', lazy='joined')

class TestGuess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'))
    tuser_id = db.Column(db.BigInteger, db.ForeignKey('tuser.id'))
    guess_is_bot = db.Column(db.Boolean)

    tuser = db.relationship('Tuser', lazy='joined')

class Tuser(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    timestamp = db.Column(db.Integer)
    user_id = db.Column(db.String(32))
    screen_name = db.Column(db.String(32))
    full_name = db.Column(db.String(32))
    bio = db.Column(db.Text)
    followers = db.Column(db.Integer)
    following = db.Column(db.Integer)
    total_tweets = db.Column(db.Integer)
    interesting = db.Column(db.Boolean)
    location = db.Column(db.Text)
    website = db.Column(db.Text)
    profile_image_url = db.Column(db.Text)
    profile_banner_url = db.Column(db.Text)
    protected = db.Column(db.Boolean)

    db.Index('tuser_by_id_timestamp', user_id, timestamp)

    tweets = db.relationship('Tweet', primaryjoin="and_(foreign(Tweet.user_id)==Tuser.user_id)", order_by="desc(Tweet.timestamp)")
    lessons = db.relationship('TuserLesson', lazy='joined')

    def __repr__(self):
        return '<TUser observation of @%s [user id=%d] at %d>' % (self.screen_name, int(self.user_id), self.timestamp)

    # I captured the small version, so strip out the _normal suffix
    def get_profile_url_fullsize(self):
        return self.profile_image_url.replace("_normal", "")

class Tweet(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    tweet_id = db.Column(db.BigInteger)
    user_id = db.Column(db.String(32))
    text = db.Column(db.Text)
    timestamp = db.Column(db.Integer)
    interesting = db.Column(db.Boolean)

    db.Index('tweet_by_tweet_id_uniq', tweet_id, unique=True)
    db.Index('tweet_by_user_id_by_time', user_id, timestamp)
    db.Index('tweet_by_timestamp', timestamp)

    entities = db.relationship('TweetEntity', lazy='joined')
    #tuser = db.relationship('Tuser', lazy='joined', primaryjoin="and_(foreign(Tuser.user_id)==Tweet.user_id)", order_by="Tuser.timestamp.desc()")

    def get_friendly_datetime(self):
        return time.strftime("%d %b, %I:%M%p", time.gmtime(self.timestamp))

class TeamBot(db.Model):
    __tablename__ = "team_bot"

    team_id = db.Column(db.Integer)
    twitter_id = db.Column(db.String(32))
    screen_name = db.Column(db.String(32))
    type = db.Column(db.Integer)
    kill_date = db.Column(db.Integer)

    db.PrimaryKeyConstraint(team_id, twitter_id)

    db.Index('by_tuser_id', twitter_id)

class TuserLesson(db.Model):
    __tablename__ = "tuser_lesson"

    id = db.Column(db.Integer, primary_key=True)
    tuser_id = db.Column(db.BigInteger, db.ForeignKey('tuser.id'))

    pointer_type = db.Column(db.String(32))
    pointer_id = db.Column(db.Text)
    message_title = db.Column(db.Text)
    message_body = db.Column(db.Text)

    db.Index('tuserlesson_by_tuser_id', tuser_id)

class TweetEntity(db.Model):
    __tablename__ = "tweet_entity"

    id = db.Column(db.Integer, primary_key=True)
    tweet_id = db.Column(db.BigInteger, db.ForeignKey('tweet.tweet_id'))
    type = db.Column(db.Text)
    text = db.Column(db.Text)

    db.Index('tweetentity_by_tweet_id', tweet_id)

class TweetEdge(db.Model):
    __tablename__ = "tuser_tuser"

    id = db.Column(db.BigInteger, primary_key=True)
    from_user = db.Column(db.String(32))
    to_user = db.Column(db.String(32))
    weight = db.Column(db.Integer)
    timestamp = db.Column(db.Integer)

def find_results(bots, test):
    '''Given a set of bots and a test which is a set of selections (that may or may not be bots) and a set of guesses, 
    compute the number of correct and incorrect guesses.'''

    data = {}
    data['correct'] = 0
    data['incorrect'] = 0
    data['test'] = test

    guesses = test.guesses
    selections = test.selections

    for guess in guesses:
        tuser = guess.tuser

        correct = (guess.guess_is_bot and tuser.user_id in bots) or ((guess.guess_is_bot is False) and tuser.user_id not in bots)

        if correct:
            data['correct'] += 1
        else:
            data['incorrect'] += 1

    return data

@app.route('/')
@requires_auth
def index():
    return render_template("index.html")

@app.route('/test/new', methods=['POST'])
@requires_auth
def test_new():
    test = Test()
    db.session.add(test)
    db.session.commit()

    difficulty = request.form["difficulty"]

    for uid in USERS[difficulty]:
        selection = TestSelection(test_id=test.id, tuser_id=uid)
        db.session.add(selection)

    db.session.commit()

    return redirect('/test/%d/0' % (test.id))

@app.route('/test/<test_id>/complete')
@requires_auth
def test_done(test_id):
    test = Test.query.filter(Test.id == test_id).first()
    bots = TeamBot.query.all()
    bots_userids = set([str(bot.twitter_id) for bot in bots])

    results = find_results(bots_userids, test)

    return render_template("test_results.html", results=results)

@app.route('/test/<test_id>/guess', methods=['POST'])
@requires_auth
def test_makeguess(test_id):
    user_id = request.form["tuser_id"]
    guess_is_bot = request.form["guess_is_bot"] == "1"

    tuser = Tuser.query.filter(Tuser.id == user_id).first()
    guess = TestGuess(test_id=test_id, tuser_id=int(user_id), guess_is_bot=guess_is_bot)
    db.session.add(guess)
    db.session.commit()

    test = Test.query.filter(Test.id == test_id).first()

    resp = {
        'complete': len(test.guesses) >= len(test.selections),
        'lessons': [],
    }

    for lesson in tuser.lessons:
        resp['lessons'].append({
            'pointer_id': lesson.pointer_id,
            'pointer_type': lesson.pointer_type,
            'tuser_id': lesson.tuser_id,
            'message_title': lesson.message_title,
            'message_body': lesson.message_body,
        })

    if resp['complete']:
        resp['next'] = "/test/%s/complete" % (test_id)
    else:
        resp['next'] = "/test/%s/%d" % (test_id, len(test.guesses))

    return jsonify(resp)

@app.route('/test/<test_id>/<guess_id>')
@requires_auth
def test_showguess(test_id, guess_id):
    test = Test.query.filter(Test.id == test_id).first()

    if int(guess_id) >= len(test.selections):
        return redirect('/test/%s/complete' % (test_id))

    tuser = tuser=test.selections[int(guess_id)].tuser
    tweets = tuser.tweets

    tuser_is_bot = len(TeamBot.query.filter(TeamBot.twitter_id == tuser.user_id).all()) > 0

    return render_template("test_guess.html", guess_id=int(guess_id), test=test, tuser=tuser, tweets=tweets, is_bot=tuser_is_bot)

@app.route('/stream')
@requires_auth
def tweet_stream():

    FRACTION_BOT_TWEETS = 1
    FRACTION_NOISE_TWEETS = 0.01

    noise = bool(request.args.get('noise', '0'))
    tag = request.args.get('tag', None)
    user = request.args.get('user', None)

    MAGIC_TWEET_START_TIMESTAMP = 1419090805 # Twitter tweet ID 546332554069282817 occurred at this timestamp
    MAGIC_TWEET_END_TIMESTAMP = 1417434398 # Twitter tweet ID 546332554069282817 occurred at this timestamp

    # Real number [0, +inf). 1 means each wall clock second = 1 virtual second. 0.1 means ten wall clock seconds to every virtual second (clock runs slow)
    TIMESTAMP_FLOW_SPEED = 0.1

    # This parameter controls what real time corresponds to the start of the virtual time.
    # Reset this to the current unix epoch "reset the clock"
    # 1455161557 = 7:32pm PT, Wednesday February 10, 2016
    WALL_TIME_ZERO = int(os.getenv('TIMESTAMP_ZERO'))

    # Request the last TIME_WINDOW virtual seconds of tweets
    TIME_WINDOW = 30

    # Later: These two (upper, lower) will be user-provided
    virtual_time_upper = time.time()
    virtual_time_upper += MAGIC_TWEET_START_TIMESTAMP - WALL_TIME_ZERO
    virtual_time_lower = virtual_time_upper - TIME_WINDOW

    bot_user_ids = [bot.twitter_id for bot in TeamBot.query.all()]

    tweets = None
    if noise:
        tweets = Tweet.query.filter(~Tweet.user_id.in_(bot_user_ids))
    else:
        tweets = Tweet.query.filter(Tweet.user_id.in_(bot_user_ids))

    tweets = tweets.filter(Tweet.timestamp < int(virtual_time_upper))
    tweets = tweets.filter(Tweet.timestamp >= int(virtual_time_lower))
    tweets = tweets.all()

    # todo: replace me with entity search
    if tag is not None:
        tweets = filter(lambda tweet: tweet.text.find("#"+tag) >= 0, tweets)
    if user is not None:
        tweets = filter(lambda tweet: tweet.text.find("@"+user) >= 0, tweets)

    return jsonify(tweets=[{'tweet': {'tweet_id': tweet.tweet_id, 'text': tweet.text}, 'entities': tweet.entities, 'user': {'screen_name': 'foobar', 'user_id': 1, 'profile_image_url': '/static/img/egg-blue.jpg'}} for tweet in tweets])

@app.route('/tracker')
@requires_auth
def tracker():
    return render_template("tracker.html")

if __name__ == "__main__":
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv("PORT")))
