import fs, { unlinkSync } from "fs";
import OpenAI from "openai/index.mjs";
import express, { Request, Response} from 'express';
import * as dotenv from 'dotenv'
import multer from "multer";

const app = express();
const port: number = 3001;

dotenv.config()

const openai: OpenAI = new OpenAI({
  apiKey: process.env.APIKEY,
});

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './inbox');
  },
  filename: function (req, file, callback) {
      callback(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({storage: storage});

app.post('/transcribe', upload.single('file'), async(req: Request, res: Response) => {
  if(!req.file){
    res.status(400).send('No file uploaded');
  }else{
    console.log(`File uploaded - req.file.path`);
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
        language: "en",
      });
      res.send(transcription);
    } catch (error) {
      res.send(error);
    }
    finally{
      await unlinkSync(req.file.path);
    }
  }
});

app.listen(port, ()=> {
  console.log(`API running on port ${port}`);
})
