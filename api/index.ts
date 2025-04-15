import fs from "fs";
import OpenAI from "openai/index.mjs";
import express, { Request, Response} from 'express';
import * as dotenv from 'dotenv'

const app = express();
const port: number = 3000;

dotenv.config()

const openai: OpenAI = new OpenAI({
  apiKey: process.env.APIKEY,
});

app.post('/transcribe', async(req: Request, res: Response) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream("audio.mp3"),
      model: "whisper-1",
      language: "en",
    });
    res.send(transcription);
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, ()=> {
  console.log(`API running on port ${port}`);
})
