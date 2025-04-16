import express, { Request, Response} from 'express';
import * as dotenv from 'dotenv'
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const port: string = process.env.PORT || "3001";

app.post('/store', async(req: Request, res: Response) => {
    console.log(req.body);
    res.send({"message":"success"})
  });

  app.listen(port, ()=> {
    console.log(`Database API running on port ${port}`);
  })
  