import AWS, { S3 } from "aws-sdk";
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ParsedUrlQuery } from "querystring";

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

const port: string = process.env.PORT || "3002";
const s3: S3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESSKEY,
  secretAccessKey: process.env.S3_SECRET,
  signatureVersion: "v4",
  region: process.env.AWS_REGION,
});

interface IData {
  Location: string;
}

app.post("/upload", async (req: Request, res: Response) => {
  try {
    const token: string = req.header("authorization") || "";
    const payload = await verifier.verify(token);
    if (payload) {
      if (req?.headers?.filename) {
        const params = {
          Bucket: process.env.S3_BUCKETNAME || "",
          Key: `${req?.headers?.filename}`,
          Body: req,
        };

        // Uploading files to the bucket
        s3.upload(params, function (err: Error, data: IData) {
          if (err) {
            res.status(400).send(err);
            console.warn(err);
          }
          res.send(req?.headers?.filename);
          console.log(
            `${req?.headers?.filename} uploaded successfully to ${data.Location}`
          );
        });
      } else {
        res
          .status(400)
          .send("Please set the filename header before uploading the file");
      }
    } else {
      res.status(400).send("No authorisation token provided");
    }
  } catch (err) {
    res.status(401).send(err);
  }
});

app.get("/stream", async (req: Request, res: Response) => {
  if (req.query.key) {
    const params = {
      Bucket: process.env.S3_BUCKETNAME || "",
      Key: req.query.key as string,
    };
    try {
      const s3stream = await s3.getObject(params).createReadStream().pipe(res);
    } catch (err) {
      res.status(400).send(err);
    }
  } else {
    res.status(400).send("No key provided");
  }
});

app.listen(port, () => {
  console.log(`S3 API running on port ${port}`);
});
