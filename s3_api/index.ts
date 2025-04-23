import AWS, { S3 } from "aws-sdk";
import fs, { unlinkSync } from "fs";
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import multer from "multer";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const cors = require("cors");
const app = express();
app.use(cors());
dotenv.config();

const port: string = process.env.PORT || "3002";
const s3: S3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESSKEY,
  secretAccessKey: process.env.S3_SECRET,
});

interface IData {
  Location: string;
}

app.post("/upload", async (req: Request, res: Response) => {
  const params = {
    Bucket: process.env.S3_BUCKETNAME,
    Key: "cat.jpg",
    Body: fileContent,
  };

  // Uploading files to the bucket
  s3.upload(params, function (err: Error, data: IData) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
});

app.listen(port, () => {
  console.log(`S3 API running on port ${port}`);
});
