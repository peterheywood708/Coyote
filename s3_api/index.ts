import AWS from "aws-sdk";
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

app.get("/", async (req: Request, res: Response) => {
  res.send("Hi!");
});

app.listen(port, () => {
  console.log(`S3 API running on port ${port}`);
});
