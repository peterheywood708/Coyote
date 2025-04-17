"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const mongodb_1 = require("mongodb");
const cors = require("cors");
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
dotenv.config();
const port = process.env.PORT || "3001";
const client = new mongodb_1.MongoClient(process.env.URI || "");
app.post("/store", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield client.connect();
        const db = client.db("coyote");
        const col = db.collection("transcripts");
        const transcriptDocument = {
            text: (_a = req.body) === null || _a === void 0 ? void 0 : _a.text,
            userId: 123456,
        };
        const p = yield col.insertOne(transcriptDocument);
        res.send(p);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
    finally {
        yield client.close();
    }
}));
app.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const db = client.db("coyote");
        const documents = yield db.collection("transcripts").find().toArray();
        res.send(documents);
    }
    catch (err) {
        res.status(400).send(err);
    }
    finally {
        yield client.close();
    }
}));
app.listen(port, () => {
    console.log(`Database API running on port ${port}`);
});
