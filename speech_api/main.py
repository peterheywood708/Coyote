import os
import torch
from flask import Flask, request, send_file
from pyannote.audio import Pipeline

app = Flask(__name__)
inFolder = 'in'
outFolder = 'out'

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    token="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")

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
        audioFile = file.save(os.path.join(inFolder,file.filename))
        print(audioFile)
        diarization = pipeline(os.path.join(inFolder,file.filename))
        for turn, _,speaker in diarization.itertracks(yield_label=True):
            print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")
        return f'{file.filename} uploaded successfully'
    except KeyError:
        return 'No file uploaded',400
    except Exception as e:
        return f'An error occured: {str(e)}',500

if __name__ == "__main__":
    app.run()