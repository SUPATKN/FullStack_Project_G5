"use strict";
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
const express = require("express");
const fs = require("fs");
const app = express();
const multer = require("multer");
const path = require("path");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
//Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*", // Allow all origins
}));
const upload = multer({ storage });
app.use("/api/images", express.static(path.join(__dirname, "../images")));
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.post("/api/upload", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = `/images/${req.file.originalname}`;
    try {
        yield client_1.dbClient
            .insert(schema_1.images)
            .values({ path: filePath })
            .returning({ id: schema_1.images.id, path: schema_1.images.path });
        res.json({ filePath });
    }
    catch (error) {
        console.error("Error saving file path to the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
const port = process.env.PORT || 3000;
app.get("/api/photo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.dbClient.query.images.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving images from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.delete("/api/photo/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../images", filename);
    const results = yield client_1.dbClient.query.images.findMany();
    if (results.length === 0)
        client_1.dbConn.end();
    try {
        // ลบไฟล์จาก directory
        fs.unlinkSync(filePath);
        // ลบ path ของไฟล์จากฐานข้อมูล
        const id = results[0].id;
        yield client_1.dbClient.delete(schema_1.images).where((0, drizzle_orm_1.eq)(schema_1.images.id, id));
        res.json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
