import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import AWS from "aws-sdk";

const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();

// Configuration of AWS
const sqs = new AWS.SQS({ apiVersion: process.env.API_VERSION });

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: `${process.env.COGNITO_USERPOOLID}`,
  tokenUse: "access",
  clientId: `${process.env.COGNITO_CLIENTID}`,
});

const port: string = process.env.PORT || "3003";

app.get("/", (Request: Request, Response: Response) => {
  Response.send("Welcome to the SQS API");
});

app.post("/new", async (Request: Request, Response: Response) => {
  if (Request.body?.file && Request.body?.userId && Request.body?.jobId) {
    const params = {
      QueueUrl: process.env.AWS_QUEUE_URL || "",
      MessageBody: JSON.stringify({
        file: Request.body?.file,
        userId: Request.body?.userId,
        jobId: Request.body?.jobId,
      }),
    };
    try {
      const data = await sqs.sendMessage(params).promise();
      Response.send(`New SQS message sent. ID: ${data.MessageId}`);
    } catch (err) {
      Response.status(400).send(err);
    }
  } else {
    Response.status(400).send("Body must include file, userId and jobId");
  }
});

app.get("/receive", async (Request: Request, Response: Response) => {
  const params = {
    QueueUrl: process.env.AWS_QUEUE_URL || "",
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0,
  };
  try {
    const data = await sqs.receiveMessage(params).promise();
    Response.send(data.Messages || []);
  } catch (err) {
    Response.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log(`SQS API running on port ${port}`);
});
