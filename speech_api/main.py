import os
import json
from flask import Flask, request, send_file

app = Flask(__name__)
inFolder = 'in'
outFolder = 'out'

#Make our directories if they don't already exist
if not os.path.exists(inFolder):
    os.makedirs(inFolder)
if not os.path.exists(outFolder):
    os.makedirs(outFolder)

#Default route
@app.route("/")
def hello():
    return "Speech API service is running"

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        file = request.files['file']
        file.save(os.path.join('in',file.filename))
        return f'{file.filename} uploaded successfully'
    except KeyError:
        return 'No file uploaded',400
    except Exception as e:
        return f'An error occured: {str(e)}',500

if __name__ == "__main__":
    app.run()