import AWS, { S3 } from "aws-sdk";
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
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
  if (req?.headers?.filename) {
    const params = {
      Bucket: process.env.S3_BUCKETNAME || "",
      Key: `${req?.headers?.filename}`,
      Body: req,
    };

    console.log(req?.headers?.filename || "");

    // Uploading files to the bucket
    s3.upload(params, function (err: Error, data: IData) {
      if (err) {
        res.status(400).send(err);
        console.warn(err);
      }
      res.send(data.Location);
      console.log(
        `${req?.headers?.filename} uploaded successfully to ${data.Location}`
      );
    });
  } else {
    res
      .status(400)
      .send("Please set the filename header before uploading the file");
  }
});

app.listen(port, () => {
  console.log(`S3 API running on port ${port}`);
});
