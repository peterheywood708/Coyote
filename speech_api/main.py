from dotenv import load_dotenv
import requests
import os
import torch
import json
import schedule
import time
import datetime
from pyannote.audio import Pipeline

#Load variables from .env
load_dotenv()

workFolder = 'work'
inFolder = 'in'

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    token=os.getenv('TOKEN'))


#Make our directories if they don't already exist
if not os.path.exists(workFolder):
    os.makedirs(workFolder)

if not os.path.exists(inFolder):
    os.makedirs(inFolder)

print(f"[{datetime.datetime.now()}] Starting Python speech")

def checkMessages():
    print("Checking for new messages..")
    session = requests.Session()
    res = session.get(os.getenv('SQS_API')+'/receive', headers={'Content-Type': 'application/json'})
    session.close()
    if not res.text:
        print("No new messages received")
        return
    try:
        jsonRes = json.loads(res.text)
        jsonBody = json.loads(jsonRes[0]['Body'])
        if not jsonBody['key']:
            print(f"[{datetime.datetime.now()}] No S3 key found")
            return
        key = jsonBody['key']
        session = requests.Session()
        s3Res = session.get(os.getenv('S3_API')+'/retrieve', headers={'Content-Type': 'application/json','Key': key})
        if not s3Res.text:
            print(f"[{datetime.datetime.now()}] Unable to retrieve file URL from S3 using key {key}")
            return
        print(f"[{datetime.datetime.now()}] Downloading {key} from {s3Res.text}")
        inFile = downloadFile(s3Res.text, key)
        print(f"[{datetime.datetime.now()}] {key} downloaded to {inFile}")
        if not inFile:
            return
        startDiarization(inFile)
    except Exception as error:
        print(f"[{datetime.datetime.now()}] {error}")

# Function to download file from S3 API service
def downloadFile(url, key):
    response = requests.get(url)
    if not response.ok:
        return
    path = os.path.join(inFolder,key)
    try:
        with open(path, mode="wb") as file:
            file.write(response.content)
        return path
    except Exception as err:
        print(f"[{datetime.datetime.now()}] {err}")
        return

# Function to start diarization once file is downloaded from s3
def startDiarization(file):
    diarization = pipeline(file)
    for turn, _,speaker in diarization.itertracks(yield_label=True):
        print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")

schedule.every(10).seconds.do(checkMessages)

while True:
    schedule.run_pending()
    time.sleep(1)