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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const aws_jwt_verify_1 = require("aws-jwt-verify");
const cors = require("cors");
const app = (0, express_1.default)();
app.use(cors());
dotenv.config();
// Verifier that expects valid access tokens:
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: `${process.env.COGNITO_USERPOOLID}`,
    tokenUse: "access",
    clientId: `${process.env.COGNITO_CLIENTID}`,
});
const port = process.env.PORT || "3002";
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.S3_ACCESSKEY,
    secretAccessKey: process.env.S3_SECRET,
    signatureVersion: "v4",
    region: process.env.AWS_REGION,
});
app.post("/upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = req.header("authorization") || "";
        const payload = yield verifier.verify(token);
        if (payload) {
            if ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.filename) {
                const params = {
                    Bucket: process.env.S3_BUCKETNAME || "",
                    Key: `${(_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.filename}`,
                    Body: req,
                };
                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    var _a, _b;
                    if (err) {
                        res.status(400).send(err);
                        console.warn(err);
                    }
                    res.send((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.filename);
                    console.log(`${(_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.filename} uploaded successfully to ${data.Location}`);
                });
            }
            else {
                res
                    .status(400)
                    .send("Please set the filename header before uploading the file");
            }
        }
        else {
            res.status(400).send("No authorisation token provided");
        }
    }
    catch (err) {
        res.status(401).send(err);
    }
}));
app.get("/retrieve", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.header("key") || "";
    if (key) {
        const params = {
            Bucket: process.env.S3_BUCKETNAME || "",
            Key: key,
        };
        try {
            const signedUrlExpireSeconds = 10;
            const url = yield s3.getSignedUrl("getObject", {
                Bucket: params.Bucket,
                Key: params.Key,
                Expires: signedUrlExpireSeconds,
            });
            res.send(url);
        }
        catch (err) {
            res.status(400).send(err);
        }
    }
    else {
        res.status(400).send("No key provided");
    }
}));
app.listen(port, () => {
    console.log(`S3 API running on port ${port}`);
});
