import os
import json
from flask import Flask

app = Flask(__name__)

#Make our directories if they don't already exist
if not os.path.exists('in'):
    os.makedirs('in')
if not os.path.exists('out'):
    os.makedirs('out')

#Default route
@app.route("/")
def hello():
    return "Speech API service is running"

if __name__ == "__main__":
    app.run()