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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const multer = require("multer");
const client_1 = require("../../db/client");
const schema_1 = require("../../db/schema");
const port = 5000;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });
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
app.get("/api/images", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.dbClient.query.images.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving images from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
