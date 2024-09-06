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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_js_1 = __importDefault(require("./auth/passport.js"));
const qrcode_1 = __importDefault(require("qrcode"));
const promptpay_qr_1 = __importDefault(require("promptpay-qr"));
const client_js_1 = require("../db/client.js");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5899",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(passport_js_1.default.initialize());
//for store photo
const storage1 = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
        const originalName = file.originalname.replace(/\s+/g, "_");
        const newFilename = `${timestamp}-${originalName}`;
        cb(null, newFilename);
    },
});
//for store profile picture
const storage2 = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../profile_picture"));
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
        const originalName = file.originalname.replace(/\s+/g, "_");
        const newFilename = `${timestamp}-${originalName}`;
        cb(null, newFilename);
    },
});
const upload = (0, multer_1.default)({ storage: storage1 });
app.use("/api/images", express_1.default.static(path_1.default.join(__dirname, "../images")));
const upload_profilePic = (0, multer_1.default)({ storage: storage2 });
app.use("/api/profilePic", express_1.default.static(path_1.default.join(__dirname, "../profile_picture")));
app.get("/", (req, res) => {
    res.send("Hello World");
});
//AUTH
app.post("/api/upload", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = `/images/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
    const userId = req.body.user_id;
    const isFree = req.body.isFree === "true"; // รับค่าเป็น string แล้วเปลี่ยนเป็น boolean
    const price = isFree ? 0 : parseInt(req.body.price, 10) || 0; // กำหนดราคาเป็น 0 หากฟรี
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const result = yield client_js_1.dbClient
            .insert(schema_1.images)
            .values({
            path: filePath,
            user_id: Number(userId),
            price: price,
            created_at: new Date(),
        })
            .returning({ id: schema_1.images.id, path: schema_1.images.path });
        res.json({ filePath });
    }
    catch (error) {
        console.error("Error saving file path to the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/photo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_js_1.dbClient.query.images.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving images from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/allusers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_js_1.dbClient.query.users.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving users from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.delete("/api/photo/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.params.filename;
    const filePath = path_1.default.join(__dirname, "../images", filename);
    try {
        fs_1.default.unlinkSync(filePath);
        const results = yield client_js_1.dbClient.query.images.findMany();
        if (results.length === 0) {
            client_js_1.dbConn.end();
            res.status(404).json({ message: "File not found in database" });
            return;
        }
        const id = results[0].id;
        yield client_js_1.dbClient.delete(schema_1.images).where((0, drizzle_orm_1.eq)(schema_1.images.id, id));
        res.json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const existingUser = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const saltRounds = 10;
        let hashedPassword = "";
        hashedPassword = yield new Promise((resolve, reject) => {
            bcrypt_1.default.hash(password, saltRounds, function (err, hash) {
                if (err)
                    reject(err);
                resolve(hash);
            });
        });
        yield client_js_1.dbClient.insert(schema_1.users).values({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/login", passport_js_1.default.authenticate("local"), function (req, res) {
    // setSessionInfoAfterLogin(req, "CREDENTIAL");
});
// app.post("/api/login", async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }
//   try {
//     const user = await dbClient.query.users.findFirst({
//       where: eq(users.email, email),
//     });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const isMatch = await compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const token = jwt.sign({ userId: user.id }, "YOUR_SECRET_KEY", {
//       expiresIn: "1h",
//     });
//     res.status(200).json({
//       message: "Login successful",
//       accessToken: token,
//       user: {
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error logging in user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// app.get("/api/user/:id", async (req: Request, res: Response) => {
//   const userId = req.params.id;
//   try {
//     const user = await dbClient.query.users.findFirst({
//       where: eq(users.id, Number(userId)),
//     });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.status(200).json({
//       id: user.id,
//       username: user.username,
//       email: user.email,
//     });
//   } catch (error) {
//     console.error("Error retrieving user information:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// app.get("/api/profile", async (req: Request, res: Response) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ error: "Authorization header missing" });
//   }
//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, "YOUR_SECRET_KEY") as { userId: number };
//     const user = await dbClient.query.users.findFirst({
//       where: eq(users.id, decoded.userId),
//     });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.status(200).json({
//       id: user.id,
//       username: user.username,
//       email: user.email,
//     });
//   } catch (error) {
//     console.error("Error retrieving user profile:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.post("/api/likes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { photo_id, user_id } = req.body;
    if (!photo_id || !user_id) {
        return res.status(400).json({ error: "Photo ID and User ID are required" });
    }
    try {
        yield client_js_1.dbClient.insert(schema_1.likes).values({
            photo_id: Number(photo_id),
            user_id: Number(user_id),
        });
        res.status(201).json({ message: "Like added successfully" });
    }
    catch (error) {
        console.error("Error adding like:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Remove Like
app.delete("/api/unlikes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { photo_id, user_id } = req.body;
    if (!photo_id || !user_id) {
        return res.status(400).json({ error: "Photo ID and User ID are required" });
    }
    try {
        yield client_js_1.dbClient
            .delete(schema_1.likes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.likes.photo_id, Number(photo_id)), (0, drizzle_orm_1.eq)(schema_1.likes.user_id, Number(user_id))));
        res.status(200).json({ message: "Like removed successfully" });
    }
    catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/getlikes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_js_1.dbClient.query.likes.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving likes from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { photo_id, user_id, content } = req.body;
    if (!photo_id || !user_id) {
        return res.status(400).json({ error: "Photo ID and User ID are required" });
    }
    try {
        yield client_js_1.dbClient.insert(schema_1.comments).values({
            photo_id: Number(photo_id),
            user_id: Number(user_id),
            content: content,
            created_at: new Date(),
        });
        res.status(201).json({ message: "Like added successfully" });
    }
    catch (error) {
        console.error("Error adding like:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/getcomments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_js_1.dbClient.query.comments.findMany();
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving likes from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/profilePic/upload", upload_profilePic.single("profilePic"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = `${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
    const userId = req.body.user_id;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        // Check if a profile picture already exists for the user
        const existingProfilePic = yield client_js_1.dbClient
            .select()
            .from(schema_1.ProfilePicture)
            .where((0, drizzle_orm_1.eq)(schema_1.ProfilePicture.user_id, Number(userId)))
            .limit(1)
            .execute();
        // If there is an existing profile picture, delete it
        if (existingProfilePic.length > 0) {
            const oldFilePath = existingProfilePic[0].path; // Access the path from the result
            if (oldFilePath) {
                // Check if oldFilePath is not null or undefined
                const fullPath = path_1.default.join(__dirname, "../profile_picture", oldFilePath);
                // Check if file exists before attempting to delete
                if (fs_1.default.existsSync(fullPath)) {
                    fs_1.default.unlinkSync(fullPath);
                }
            }
            yield client_js_1.dbClient
                .delete(schema_1.ProfilePicture) // Specify the table to delete from
                .where((0, drizzle_orm_1.eq)(schema_1.ProfilePicture.user_id, Number(userId)))
                .execute();
        }
        // Insert the new profile picture
        yield client_js_1.dbClient
            .insert(schema_1.ProfilePicture)
            .values({
            path: filePath,
            user_id: Number(userId),
            created_at: new Date(),
        })
            .returning({ id: schema_1.ProfilePicture.id, path: schema_1.ProfilePicture.path })
            .execute();
        res.json({ filePath });
    }
    catch (error) {
        console.error("Error saving file path to the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/profilePic/get", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const result = yield client_js_1.dbClient.query.ProfilePicture.findMany();
        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result);
    }
    catch (error) {
        console.error("Error retrieving images from the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
app.post("/api/cart/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, photo_id } = req.body;
    if (!photo_id || !user_id) {
        return res.status(400).json({ error: "Photo ID and User ID are required" });
    }
    try {
        // ตรวจสอบว่าผู้ใช้กำลังพยายามเพิ่มรูปของตัวเองหรือไม่
        const photo = yield client_js_1.dbClient.query.images.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.images.id, Number(photo_id)),
        });
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }
        if (photo.user_id === Number(user_id)) {
            return res
                .status(400)
                .json({ error: "Cannot add your own photo to the cart" });
        }
        // ค้นหา cart ที่มีอยู่แล้วสำหรับ user_id นี้
        let cart = yield client_js_1.dbClient
            .select()
            .from(schema_1.carts)
            .where((0, drizzle_orm_1.eq)(schema_1.carts.user_id, Number(user_id)))
            .limit(1)
            .execute()
            .then((result) => result[0]); // ดึงแถวแรกออกมา หรือ undefined ถ้าไม่พบ
        // ถ้าไม่มี cart ให้สร้างใหม่
        if (!cart) {
            const [newCart] = yield client_js_1.dbClient
                .insert(schema_1.carts)
                .values({
                user_id: Number(user_id),
                created_at: new Date(),
                updated_at: new Date(),
            })
                .returning({
                cart_id: schema_1.carts.cart_id,
                user_id: schema_1.carts.user_id,
                created_at: schema_1.carts.created_at,
                updated_at: schema_1.carts.updated_at,
            });
            cart = newCart; // ใช้ newCart ที่ดึงมาจากอาร์เรย์
        }
        // เพิ่มรายการใหม่ใน cart_items โดยใช้ cart_id ที่มีอยู่หรือสร้างใหม่
        yield client_js_1.dbClient.insert(schema_1.cart_items).values({
            photo_id: Number(photo_id),
            cart_id: cart.cart_id,
        });
        // อัปเดตเวลาของ cart ในฟิลด์ updated_at
        yield client_js_1.dbClient
            .update(schema_1.carts)
            .set({ updated_at: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.carts.cart_id, cart.cart_id));
        res
            .status(201)
            .json({ message: "Item added to cart and cart updated successfully" });
    }
    catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// API endpoint เพื่อทำการลบข้อมูลในตะกร้า
// app.post('/api/cart/clear', async (req, res) => {
//   const { userId } = req.body;
//   try {
//     // ลบข้อมูลที่ตรงกับ userId
//     await carts.delete().where({ user_id: userId }).execute();
//     res.status(200).json({ message: "Cart cleared successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error clearing cart", error });
//   }
// });
app.get("/api/cart/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const cart = yield client_js_1.dbClient
            .select()
            .from(schema_1.carts)
            .where((0, drizzle_orm_1.eq)(schema_1.carts.user_id, Number(userId)))
            .limit(1)
            .execute()
            .then((result) => result[0]);
        if (!cart) {
            return res.json([]); // Return an empty array if no cart exists for the user
        }
        const cartItems = yield client_js_1.dbClient
            .select({
            id: schema_1.images.id,
            path: schema_1.images.path,
            user_id: schema_1.images.user_id,
            price: schema_1.images.price,
        })
            .from(schema_1.cart_items)
            .leftJoin(schema_1.images, (0, drizzle_orm_1.eq)(schema_1.cart_items.photo_id, schema_1.images.id))
            .where((0, drizzle_orm_1.eq)(schema_1.cart_items.cart_id, cart.cart_id))
            .execute();
        res.json(cartItems);
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/generateQR", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = parseFloat(req.body.amount); // Get amount from request body
    const mobileNumber = "0885755068";
    const payload = (0, promptpay_qr_1.default)(mobileNumber, { amount });
    const option = {
        color: {
            dark: "#000",
            light: "#fff",
        },
    };
    try {
        qrcode_1.default.toDataURL(payload, option, (err, url) => {
            if (err) {
                console.error("QR Code generation failed:", err);
                return res.status(400).json({
                    RespCode: 400,
                    RespMessage: "QR Code generation failed: " + err.message,
                });
            }
            res.status(200).json({
                RespCode: 200,
                RespMessage: "QR Code generated successfully",
                Result: url,
            });
        });
    }
    catch (error) {
        console.error("Error generating QR Code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// QR Code generation endpoint
app.post("/api/generateQR", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = parseFloat(req.body.amount);
    const mobileNumber = "0885755068";
    const payload = (0, promptpay_qr_1.default)(mobileNumber, { amount });
    const option = {
        color: {
            dark: "#000",
            light: "#fff",
        },
    };
    try {
        qrcode_1.default.toDataURL(payload, option, (err, url) => {
            if (err) {
                console.error("QR Code generation failed:", err);
                return res.status(400).json({
                    RespCode: 400,
                    RespMessage: "QR Code generation failed: " + err.message,
                });
            }
            res.status(200).json({
                RespCode: 200,
                RespMessage: "QR Code generated successfully",
                Result: url,
            });
        });
    }
    catch (error) {
        console.error("Error generating QR Code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/coin/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
        const user = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            userId: user.id,
            coin: user.coin,
        });
    }
    catch (error) {
        console.error("Error retrieving user coin balance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/coin/transactions/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
        const transactions = yield client_js_1.dbClient.query.coin_transactions.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.coin_transactions.user_id, userId),
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error("Error retrieving user coin transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/photo/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const photoId = parseInt(req.params.id, 10);
    if (isNaN(photoId)) {
        return res.status(400).json({ error: "Invalid photo ID" });
    }
    try {
        const photo = yield client_js_1.dbClient.query.images.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.images.id, photoId),
        });
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }
        res.status(200).json(photo);
    }
    catch (error) {
        console.error("Error retrieving photo detail:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/photo/:photoId/user/:userId/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const photoId = parseInt(req.params.photoId, 10);
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(photoId) || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid photo ID or user ID" });
    }
    try {
        const ownership = yield client_js_1.dbClient.query.image_ownerships.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.image_ownerships.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.image_ownerships.image_id, photoId)),
        });
        res.status(200).json({
            purchased: !!ownership,
        });
    }
    catch (error) {
        console.error("Error checking purchase status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/api/photo/:photoId/buy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const photoId = parseInt(req.params.photoId, 10);
    const { userId } = req.body;
    if (isNaN(photoId) || !userId) {
        return res.status(400).json({ error: "Invalid photo ID or user ID" });
    }
    try {
        const photo = yield client_js_1.dbClient.query.images.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.images.id, photoId),
        });
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }
        // ตรวจสอบว่าผู้ใช้กำลังพยายามซื้อรูปของตัวเองหรือไม่
        if (photo.user_id === Number(userId)) {
            return res.status(400).json({ error: "Cannot buy your own photo" });
        }
        const buyer = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
        });
        if (!buyer) {
            return res.status(404).json({ error: "User not found" });
        }
        if (buyer.coin < photo.price) {
            return res.status(400).json({ error: "Insufficient funds" });
        }
        const seller = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, photo.user_id),
        });
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }
        yield client_js_1.dbClient.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            yield trx
                .update(schema_1.users)
                .set({ coin: buyer.coin - photo.price })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            yield trx
                .update(schema_1.users)
                .set({ coin: seller.coin + photo.price })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, photo.user_id));
            yield trx.insert(schema_1.image_ownerships).values({
                user_id: userId,
                image_id: photoId,
                purchased_at: new Date(),
            });
            yield trx.insert(schema_1.coin_transactions).values({
                user_id: userId,
                amount: -photo.price,
                transaction_type: "purchase",
                description: `Purchased photo ${photoId}`,
            });
            yield trx.insert(schema_1.coin_transactions).values({
                user_id: photo.user_id,
                amount: photo.price,
                transaction_type: "sale",
                description: `Sold photo ${photoId}`,
            });
        }));
        res.status(200).json({ message: "Purchase successful" });
    }
    catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get all photos purchased by a specific user
app.get("/api/user/:userId/purchased-photos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        // ค้นหารูปภาพที่ผู้ใช้ได้ซื้อ
        const purchasedPhotos = yield client_js_1.dbClient
            .select({
            id: schema_1.images.id,
            path: schema_1.images.path,
            price: schema_1.images.price,
            purchased_at: schema_1.image_ownerships.purchased_at,
        })
            .from(schema_1.image_ownerships) // หรือตารางที่เก็บข้อมูลการซื้อ
            .leftJoin(schema_1.images, (0, drizzle_orm_1.eq)(schema_1.image_ownerships.image_id, schema_1.images.id))
            .where((0, drizzle_orm_1.eq)(schema_1.image_ownerships.user_id, Number(userId)))
            .execute();
        if (purchasedPhotos.length === 0) {
            return res.json([]); // Return an empty array if no photos are purchased
        }
        res.json(purchasedPhotos);
    }
    catch (error) {
        console.error("Error fetching purchased photos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
