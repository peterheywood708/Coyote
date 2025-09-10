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
const aws_jwt_verify_1 = require("aws-jwt-verify");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
dotenv.config();
// Verifier that expects valid access tokens:
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: `${process.env.COGNITO_USERPOOLID}`,
    tokenUse: "access",
    clientId: `${process.env.COGNITO_CLIENTID}`,
});
const port = process.env.PORT || "3001";
const client = new mongodb_1.MongoClient(process.env.URI || "");
app.post("/store", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token = req.header("authorization") || "";
        const payload = yield verifier.verify(token);
        if (payload) {
            try {
                yield client.connect();
                const db = client.db("coyote");
                const col = db.collection("jobs");
                const transcriptDocument = {
                    file: (_a = req.body) === null || _a === void 0 ? void 0 : _a.file,
                    fileName: (_b = req.body) === null || _b === void 0 ? void 0 : _b.fileName,
                    status: (_c = req.body) === null || _c === void 0 ? void 0 : _c.status,
                    sqsId: null,
                    userId: payload === null || payload === void 0 ? void 0 : payload.username,
                    date: Date.now(),
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
        }
        else {
            res.status(400).send("No authorisation token provided");
        }
    }
    catch (err) {
        console.warn(err);
        res.status(401).send(err);
    }
}));
app.post("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = req.header("authorization") || "";
        const payload = yield verifier.verify(token);
        if (payload) {
            try {
                yield client.connect();
                const db = client.db("coyote");
                const col = db.collection("jobs");
                const p = yield col.deleteOne({
                    _id: mongodb_1.ObjectId.createFromHexString((_a = req.body) === null || _a === void 0 ? void 0 : _a.id),
                    userId: payload === null || payload === void 0 ? void 0 : payload.username,
                });
                res.send(p);
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
            finally {
                yield client.close();
            }
        }
        else {
            res.status(400).send("No authorisation token provided");
        }
    }
    catch (err) {
        console.warn(err);
        res.status(401).send(err);
    }
}));
app.post("/updatestatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    console.log("New request received - Job ID: " +
        ((_a = req.body) === null || _a === void 0 ? void 0 : _a.jobId) +
        ", Status: " +
        ((_b = req.body) === null || _b === void 0 ? void 0 : _b.status) +
        ", Transcript ID: " +
        ((_c = req.body) === null || _c === void 0 ? void 0 : _c.transcriptId));
    try {
        yield client.connect();
        const db = client.db("coyote");
        const col = db.collection("jobs");
        if (((_d = req.body) === null || _d === void 0 ? void 0 : _d.status) && ((_e = req.body) === null || _e === void 0 ? void 0 : _e.status)) {
            const p = yield col.updateOne({ _id: mongodb_1.ObjectId.createFromHexString((_f = req.body) === null || _f === void 0 ? void 0 : _f.jobId) }, {
                $set: {
                    status: (_g = req.body) === null || _g === void 0 ? void 0 : _g.status,
                    transcriptId: (_h = req.body) === null || _h === void 0 ? void 0 : _h.transcriptId,
                },
            });
            res.send(p);
        }
        else {
            res.status(400).send("Ensure both job id and transcript id are provided");
        }
    }
    catch (err) {
        console.warn(err);
        res.status(400).send(err);
    }
    finally {
        yield client.close();
    }
}));
app.post("/newtranscript", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        try {
            yield client.connect();
            const db = client.db("coyote");
            const col = db.collection("transcripts");
            const transcriptDocument = {
                userId: (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId,
                jobId: (_b = req.body) === null || _b === void 0 ? void 0 : _b.jobId,
                diarizations: (_c = req.body) === null || _c === void 0 ? void 0 : _c.diarizations,
            };
            const p = yield col.insertOne(transcriptDocument);
            res.send(p);
        }
        catch (err) {
            console.warn(err);
            res.status(400).send(err);
        }
        finally {
            yield client.close();
        }
    }
    catch (err) {
        console.warn(err);
        res.status(401).send(err);
    }
}));
app.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("authorization") || "";
        const payload = yield verifier.verify(token);
        if (payload) {
            try {
                yield client.connect();
                const db = client.db("coyote");
                const documents = yield db
                    .collection("jobs")
                    .find({ userId: payload === null || payload === void 0 ? void 0 : payload.username })
                    .sort({ date: -1 })
                    .toArray();
                res.send(documents);
            }
            catch (err) {
                console.warn(err);
                res.status(400).send(err);
            }
            finally {
                yield client.close();
            }
        }
    }
    catch (err) {
        console.warn(err);
        res.status(401).send(err);
    }
}));
app.listen(port, () => {
    console.log(`Database API running on port ${port}`);
});
