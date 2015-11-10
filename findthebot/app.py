import os

from flask import Flask

app = Flask(__name__)

debug = os.getenv('DEBUG') is not None

if os.getenv('DATABASE_URL') is None:
    raise ValueError('Missing DATABASE_URL')

@app.route('/')
def index():
    return "Hello, World!"

if __name__ == "__main__":
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv("PORT")))
