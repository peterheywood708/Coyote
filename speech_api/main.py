from dotenv import load_dotenv
from pydub import AudioSegment
from openai import OpenAI
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

# Our class for diarization and transcriptions
class Diarization:
    def __init__(self, speaker, text, start, end):
        self.speaker = speaker
        self.text = text
        self.start = start
        self.end = end

# Make our directories if they don't already exist
if not os.path.exists(workFolder):
    os.makedirs(workFolder)

if not os.path.exists(inFolder):
    os.makedirs(inFolder)

print(f"[{datetime.datetime.now()}] Starting Python speech")

client = OpenAI()

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    token=os.getenv('TOKEN'))

file = 'in\\1755643752826_2013-5-documentary-1-historical-alex-warner.mp3'

# Function to start diarization once file is downloaded from s3
def startDiarization(file):
    diarizationTranscriptions = []
    diarization = pipeline(file)
    for turn, _,speaker in diarization.itertracks(yield_label=True):
        # Use Pydub to split the audio from speaker start and end
        clipStart = int(turn.start * 1000)
        clipEnd = int(turn.end * 1000)
        audioFile = AudioSegment.from_file(file)
        # Create a temporary name for our spliced audio
        clipFileName = f"{workFolder}\\{clipStart}_{clipEnd}.mp3"
        audioPartition = audioFile[ clipStart : clipEnd]
        try:
            clipToTranscribe = audioPartition.export(clipFileName, format="mp3")
            # Transcribe the sliced audio with Open AI whisper
            transcription = client.audio.transcriptions.create(
                model="gpt-4o-transcribe",
                file=clipToTranscribe
            )
            # Add the transcription and diarizations to our array ready to send to database table
            diarizationTranscriptions.append(Diarization(speaker=speaker, text=transcription.text, start=clipStart, end=clipEnd))
        except Exception:
            print(Exception) 
        finally:
            clipToTranscribe.close()
            os.remove(clipFileName)
    print(json.dumps([Diarization.__dict__ for Diarization in diarizationTranscriptions]))

startDiarization(file)

# def checkMessages():
#     print("Checking for new messages..")
#     session = requests.Session()
#     res = session.get(os.getenv('SQS_API')+'/receive', headers={'Content-Type': 'application/json'})
#     session.close()
#     if not res.text:
#         print("No new messages received")
#         return
#     try:
#         jsonRes = json.loads(res.text)
#         jsonBody = json.loads(jsonRes[0]['Body'])
#         if not jsonBody['key']:
#             print(f"[{datetime.datetime.now()}] No S3 key found")
#             return
#         key = jsonBody['key']
#         session = requests.Session()
#         s3Res = session.get(os.getenv('S3_API')+'/retrieve', headers={'Content-Type': 'application/json','Key': key})
#         if not s3Res.text:
#             print(f"[{datetime.datetime.now()}] Unable to retrieve file URL from S3 using key {key}")
#             return
#         print(f"[{datetime.datetime.now()}] Downloading {key} from {s3Res.text}")
#         inFile = downloadFile(s3Res.text, key)
#         print(f"[{datetime.datetime.now()}] {key} downloaded to {inFile}")
#         if not inFile:
#             return
#         startDiarization(inFile)
#     except Exception as error:
#         print(f"[{datetime.datetime.now()}] {error}")

# # Function to download file from S3 API service
# def downloadFile(url, key):
#     response = requests.get(url)
#     if not response.ok:
#         return
#     path = os.path.join(inFolder,key)
#     try:
#         with open(path, mode="wb") as file:
#             file.write(response.content)
#         return path
#     except Exception as err:
#         print(f"[{datetime.datetime.now()}] {err}")
#         return



# schedule.every(10).seconds.do(checkMessages)

# while True:
#     schedule.run_pending()
#     time.sleep(1)