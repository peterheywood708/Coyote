import fs, { unlinkSync } from "fs";
import OpenAI from "openai";
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import multer from "multer";
import { CognitoJwtVerifier } from "aws-jwt-verify";
const cors = require("cors");

const app = express();
app.use(cors());

dotenv.config();

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: `${process.env.COGNITO_USERPOOLID}`,
  tokenUse: "access",
  clientId: `${process.env.COGNITO_CLIENTID}`,
});

const openai: OpenAI = new OpenAI({
  apiKey: process.env.APIKEY,
});

const port: string = process.env.PORT || "3000";

try {
  if (!fs.existsSync("inbox")) {
    fs.mkdirSync("inbox");
  }
} catch (err) {
  console.error(err);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./inbox");
  },
  filename: function (req, file, callback) {
    callback(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/transcribe",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send("No file uploaded");
    } else {
      console.log(`File uploaded - ${req.file.path}`);

      try {
        const token: string = req.header("authorization") || "";
        const payload = await verifier.verify(token);
        if (payload) {
          try {
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(req.file.path),
              model: "whisper-1",
              language: "en",
            });
            res.send(transcription);
          } catch (err) {
            console.warn(err);
            res.status(400).send(err);
          } finally {
            await unlinkSync(req.file.path);
          }
        }
      } catch (err) {
        console.warn(err);
        res.status(401).send(err);
      }
    }
  }
);

app.listen(port, () => {
  console.log(`AI API running on port ${port}`);
});
