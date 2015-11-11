import os

from flask import Flask, redirect, render_template, request
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)

debug = os.getenv('DEBUG') is not None

if os.getenv('DATABASE_URL') is None:
    raise ValueError('Missing DATABASE_URL')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

db = SQLAlchemy(app)

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

    tweets = db.relationship('Tweet', primaryjoin="and_(foreign(Tweet.user_id)==Tuser.user_id)")

    def __repr__(self):
        return '<TUser observation of @%s [user id=%d] at %d>' % (self.screen_name, int(self.user_id), self.timestamp)

class Tweet(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    tweet_id = db.Column(db.BigInteger)
    user_id = db.Column(db.String(32))
    text = db.Column(db.Text)
    timestamp = db.Column(db.Integer)
    interesting = db.Column(db.Boolean)

    db.Index('tweet_by_tweet_id', tweet_id)
    db.Index('tweet_by_user_id_by_time', user_id, timestamp)

class TeamBot(db.Model):
    __tablename__ = "team_bot"

    team_id = db.Column(db.Integer)
    twitter_id = db.Column(db.String(32))
    screen_name = db.Column(db.String(32))
    type = db.Column(db.Integer)
    kill_date = db.Column(db.Integer)

    db.PrimaryKeyConstraint(team_id, twitter_id)

    db.Index('by_tuser_id', twitter_id)

randoms = [
    5588759, # Fenvirantiviral
    5582774, # Random 1
    5586448, # SarahAndFam
    5586871, # Rnadom 2
    5582960 # Random 3
]

def find_results(test):
    data = {}
    data['correct'] = 0
    data['incorrect'] = 0
    data['test'] = test

    guesses = test.guesses
    selections = test.selections

    bots = TeamBot.query.all()

    for guess in guesses:
        tuser = guess.tuser

        correct = False

        for bot in bots:
            if bot.twitter_id == tuser.user_id:
                correct = True

        if correct:
            data['correct'] += 1
        else:
            data['incorrect'] += 1

    return data

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/test/new')
def test_new():
    test = Test()
    db.session.add(test)
    db.session.commit()

    for uid in randoms:
        selection = TestSelection(test_id=test.id, tuser_id=uid)
        db.session.add(selection)

    db.session.commit()

    return redirect('/test/%d/0' % (test.id))

@app.route('/test/<test_id>/complete')
def test_done(test_id):
    test = Test.query.filter(Test.id == test_id).first()

    results = find_results(test)

    return render_template("test_results.html", results=results)

@app.route('/test/<test_id>/guess', methods=['POST'])
def test_makeguess(test_id):
    user_id = request.form["tuser_id"]
    botornot = request.form["botornot"]

    guess = TestGuess(test_id=test_id, tuser_id=int(user_id), guess_is_bot=bool(botornot))
    db.session.add(guess)
    db.session.commit()

    test = Test.query.filter(Test.id == test_id).first()

    if len(test.guesses) >= len(test.selections):
        return redirect("/test/%s/complete" % (test_id))
    else:
        return redirect("/test/%s/%d" % (test_id, len(test.guesses)))

@app.route('/test/<test_id>/<guess_id>')
def test_showguess(test_id, guess_id):
    test = Test.query.filter(Test.id == test_id).first()

    if int(guess_id) >= len(test.selections):
        return redirect('/test/%s/complete' % (test_id))

    tuser = tuser=test.selections[int(guess_id)].tuser
    tweets = tuser.tweets

    return render_template("make_guess.html", guess_id=int(guess_id), test=test, tuser=tuser, tweets=tweets)

if __name__ == "__main__":
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv("PORT")))
