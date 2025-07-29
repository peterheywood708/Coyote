import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Collection, Db, MongoClient } from "mongodb";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: `${process.env.COGNITO_USERPOOLID}`,
  tokenUse: "access",
  clientId: `${process.env.COGNITO_CLIENTID}`,
});

const port: string = process.env.PORT || "3001";
const client: MongoClient = new MongoClient(process.env.URI || "");

app.post("/store", async (req: Request, res: Response) => {
  try {
    const token: string = req.header("authorization") || "";
    const payload = await verifier.verify(token);
    if (payload) {
      try {
        await client.connect();
        const db: Db = client.db("coyote");
        const col: Collection = db.collection("jobs");
        const transcriptDocument: Object = {
          file: req.body?.file,
          fileName: req.body?.fileName,
          status: req.body?.status,
          sqsId: null,
          userId: req.body?.userId,
          date: Date.now(),
        };
        const p = await col.insertOne(transcriptDocument);
        res.send(p);
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      } finally {
        await client.close();
      }
    } else {
      res.status(400).send("No authorisation token provided");
    }
  } catch (err) {
    console.warn(err);
    res.status(401).send(err);
  }
});

app.get("/list", async (req: Request, res: Response) => {
  try {
    const token: string = req.header("authorization") || "";
    const payload = await verifier.verify(token);
    if (payload) {
      try {
        await client.connect();
        const db: Db = client.db("coyote");
        const documents = await db
          .collection("jobs")
          .find({ userId: payload?.sub })
          .toArray();
        res.send(documents);
      } catch (err) {
        console.warn(err);
        res.status(400).send(err);
      } finally {
        await client.close();
      }
    }
  } catch (err) {
    console.warn(err);
    res.status(401).send(err);
  }
});

app.listen(port, () => {
  console.log(`Database API running on port ${port}`);
});
