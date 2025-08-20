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
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv = __importStar(require("dotenv"));
const aws_jwt_verify_1 = require("aws-jwt-verify");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const cors = require("cors");
const app = (0, express_1.default)();
app.use(cors());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
dotenv.config();
// Configuration of AWS
const sqs = new aws_sdk_1.default.SQS({ apiVersion: process.env.API_VERSION });
// Verifier that expects valid access tokens:
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: `${process.env.COGNITO_USERPOOLID}`,
    tokenUse: "access",
    clientId: `${process.env.COGNITO_CLIENTID}`,
});
const port = process.env.PORT || "3003";
app.get("/", (Request, Response) => {
    Response.send("Welcome to the SQS API");
});
app.post("/new", (Request, Response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    if (((_a = Request.body) === null || _a === void 0 ? void 0 : _a.key) && ((_b = Request.body) === null || _b === void 0 ? void 0 : _b.userId) && ((_c = Request.body) === null || _c === void 0 ? void 0 : _c.jobId)) {
        const messageBody = {
            key: (_d = Request.body) === null || _d === void 0 ? void 0 : _d.key,
            userId: (_e = Request.body) === null || _e === void 0 ? void 0 : _e.userId,
            jobId: (_f = Request.body) === null || _f === void 0 ? void 0 : _f.jobId,
        };
        const params = {
            QueueUrl: process.env.AWS_QUEUE_URL || "",
            MessageBody: JSON.stringify(messageBody),
        };
        try {
            const data = yield sqs.sendMessage(params).promise();
            Response.send(`New SQS message sent. ID: ${data.MessageId}`);
        }
        catch (err) {
            Response.status(400).send(err);
        }
    }
    else {
        Response.status(400).send("Body must include key, userId and jobId");
    }
}));
app.get("/receive", (Request, Response) => __awaiter(void 0, void 0, void 0, function* () {
    // The below prevents caching so that messages from SQS are not recieved more than once
    Response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const params = {
        QueueUrl: process.env.AWS_QUEUE_URL || "",
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 3600,
        WaitTimeSeconds: 0,
    };
    try {
        const data = yield sqs.receiveMessage(params).promise();
        Response.send(data.Messages || []);
    }
    catch (err) {
        Response.status(400).send(err);
    }
}));
app.listen(port, () => {
    console.log(`SQS API running on port ${port}`);
});
