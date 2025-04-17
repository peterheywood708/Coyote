import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import { Collection, Db, MongoClient } from "mongodb";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const port: string = process.env.PORT || "3001";
const client: MongoClient = new MongoClient(process.env.URI || "");

app.post("/store", async (req: Request, res: Response) => {
  try {
    await client.connect();
    const db: Db = client.db("coyote");
    const col: Collection = db.collection("transcripts");
    const transcriptDocument: Object = {
      text: req.body?.text,
      userId: 123456,
    };
    const p = await col.insertOne(transcriptDocument);
    res.send(p);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  } finally {
    await client.close();
  }
});

app.get('/list', async (req: Request, res: Response)=>{
  try{
    await client.connect();
    const db: Db = client.db("coyote");
    const documents = await db.collection("transcripts").find().toArray();
    res.send(documents);
  } catch(err) {
    res.status(400).send(err);
  } finally {
    await client.close();
  }
})

app.listen(port, () => {
  console.log(`Database API running on port ${port}`);
});
