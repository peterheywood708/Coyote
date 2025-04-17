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
const fs_1 = __importStar(require("fs"));
const openai_1 = __importDefault(require("openai"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const cors = require('cors');
const app = (0, express_1.default)();
app.use(cors());
dotenv.config();
const openai = new openai_1.default({
    apiKey: process.env.APIKEY,
});
const port = process.env.PORT || "3000";
try {
    if (!fs_1.default.existsSync('inbox')) {
        fs_1.default.mkdirSync('inbox');
    }
}
catch (err) {
    console.error(err);
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './inbox');
    },
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
app.post('/transcribe', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send('No file uploaded');
    }
    else {
        console.log(`File uploaded - ${req.file.path}`);
        try {
            const transcription = yield openai.audio.transcriptions.create({
                file: fs_1.default.createReadStream(req.file.path),
                model: "whisper-1",
                language: "en",
            });
            res.send(transcription);
        }
        catch (error) {
            res.send(error);
        }
        finally {
            yield (0, fs_1.unlinkSync)(req.file.path);
        }
    }
}));
app.listen(port, () => {
    console.log(`AI API running on port ${port}`);
});
