import os

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask import redirect

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
    tuser_id = db.Column(db.Integer, db.ForeignKey('tuser.id'))
    order = db.Column(db.Integer)

    tuser = db.relationship('Tuser', lazy='joined')

class TestGuess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'))
    tuser_id = db.Column(db.Integer, db.ForeignKey('tuser.id'))
    guess_is_bot = db.Column(db.Boolean)

    tuser = db.relationship('Tuser', lazy='joined')

class Tuser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
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

    def __repr__(self):
        return '<TUser observation of @%s [user id=%d] at %d>' % (self.screen_name, int(self.user_id), self.timestamp)

randoms = [
    5588759, # Fenvirantiviral
    5582774, # Random 1
    5586448, # SarahAndFam
    5586871, # Rnadom 2
    5582960 # Random 3
]

@app.route('/')
def index():
    return "Index"

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

    return "Showing %s" % (str(test))

@app.route('/test/<test_id>/<guess_id>')
def test_makeguess(test_id, guess_id):
    test = Test.query.filter(Test.id == test_id).first()

    if int(guess_id) >= len(test.selections):
        return redirect('/test/%s/complete' % (test_id))

    return "Showing profile for %d/%d of %s" % (int(guess_id)+1, len(test.selections), test.selections[int(guess_id)].tuser.screen_name)

if __name__ == "__main__":
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv("PORT")))
