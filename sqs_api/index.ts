import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
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

const port: string = process.env.PORT || "3003";

app.get("/", (Request, Response) => {
  Response.send("Welcome to the SQS API");
});

app.listen(port, () => {
  console.log(`SQS API running on port ${port}`);
});
