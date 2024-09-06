import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import morgan from "morgan";
import sessionIns, {
  setSessionInfoAfterLogin,
  formatSession,
} from "./auth/session";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import passportIns from "./auth/passport";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { dbClient, dbConn } from "@db/client";
import {
  images,
  users,
  likes,
  comments,
  carts,
  cart_items,
  ProfilePicture,
  coin_transactions,
  image_ownerships,
} from "@db/schema";
import { and, eq } from "drizzle-orm";

type CartType = {
  cart_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
};

const app = express();
app.use(sessionIns);
app.use(
  cors({
    origin: "http://localhost:5899",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials (cookies)
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
app.use(morgan("dev", { immediate: true }));
app.use(passportIns.initialize());
app.use(passportIns.session());

//for store photo
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
    const originalName = file.originalname.replace(/\s+/g, "_");
    const newFilename = `${timestamp}-${originalName}`;
    cb(null, newFilename);
  },
});

//for store profile picture
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../profile_picture"));
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
    const originalName = file.originalname.replace(/\s+/g, "_");
    const newFilename = `${timestamp}-${originalName}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage1 });
app.use("/api/images", express.static(path.join(__dirname, "../images")));

const upload_profilePic = multer({ storage: storage2 });

app.use(
  "/api/profilePic",
  express.static(path.join(__dirname, "../profile_picture"))
);

app.get("/", async (req, res, next) => {
  const sessions = await formatSession(req);
});

//AUTH

app.post("/api/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await dbClient.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const saltRounds = 10;
    let hashedPassword = "";
    hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });

    await dbClient.insert(users).values({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/login",
  passportIns.authenticate("local"),
  function (req, res) {
    setSessionInfoAfterLogin(req, "CREDENTIAL");

    if (req?.user) {
      res.status(200).json({
        message: "Login successful",
        user: req.user,
      });
    } else {
      res.status(500).json({ error: "no user" });
    }
  }
);

app.post(
  "/api/upload",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const filePath = `/images/${req.file?.filename}`;
    const userId = req.body.user_id;
    const isFree = req.body.isFree === "true"; // รับค่าเป็น string แล้วเปลี่ยนเป็น boolean
    const price = isFree ? 0 : parseInt(req.body.price, 10) || 0; // กำหนดราคาเป็น 0 หากฟรี

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const result = await dbClient
        .insert(images)
        .values({
          path: filePath,
          user_id: Number(userId),
          price: price,
          created_at: new Date(),
        })
        .returning({ id: images.id, path: images.path });

      res.json({ filePath });
    } catch (error) {
      console.error("Error saving file path to the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get("/api/photo", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.images.findMany();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving images from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/allusers", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.users.findMany();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving users from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/photo/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../images", filename);

  try {
    fs.unlinkSync(filePath);

    const results = await dbClient.query.images.findMany();
    if (results.length === 0) {
      dbConn.end();
      res.status(404).json({ message: "File not found in database" });
      return;
    }

    const id = results[0].id;
    await dbClient.delete(images).where(eq(images.id, id));

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

app.get("/api/profile", async (req: Request, res: Response) => {
  // Check if session is available
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.session.user.id;

  try {
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/likes", async (req: Request, res: Response) => {
  const { photo_id, user_id } = req.body;

  if (!photo_id || !user_id) {
    return res.status(400).json({ error: "Photo ID and User ID are required" });
  }

  try {
    await dbClient.insert(likes).values({
      photo_id: Number(photo_id),
      user_id: Number(user_id),
    });

    res.status(201).json({ message: "Like added successfully" });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove Like
app.delete("/api/unlikes", async (req: Request, res: Response) => {
  const { photo_id, user_id } = req.body;

  if (!photo_id || !user_id) {
    return res.status(400).json({ error: "Photo ID and User ID are required" });
  }

  try {
    await dbClient
      .delete(likes)
      .where(
        and(
          eq(likes.photo_id, Number(photo_id)),
          eq(likes.user_id, Number(user_id))
        )
      );
    res.status(200).json({ message: "Like removed successfully" });
  } catch (error) {
    console.error("Error removing like:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getlikes", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.likes.findMany();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving likes from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/comments", async (req: Request, res: Response) => {
  const { photo_id, user_id, content } = req.body;

  if (!photo_id || !user_id) {
    return res.status(400).json({ error: "Photo ID and User ID are required" });
  }

  try {
    await dbClient.insert(comments).values({
      photo_id: Number(photo_id),
      user_id: Number(user_id),
      content: content,
      created_at: new Date(),
    });

    res.status(201).json({ message: "Like added successfully" });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getcomments", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.comments.findMany();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving likes from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/profilePic/upload",
  upload_profilePic.single("profilePic"),
  async (req: Request, res: Response) => {
    const filePath = `${req.file?.filename}`;
    const userId = req.body.user_id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      // Check if a profile picture already exists for the user
      const existingProfilePic = await dbClient
        .select()
        .from(ProfilePicture)
        .where(eq(ProfilePicture.user_id, Number(userId)))
        .limit(1)
        .execute();

      // If there is an existing profile picture, delete it
      if (existingProfilePic.length > 0) {
        const oldFilePath = existingProfilePic[0].path; // Access the path from the result

        if (oldFilePath) {
          // Check if oldFilePath is not null or undefined
          const fullPath = path.join(
            __dirname,
            "../profile_picture",
            oldFilePath
          );

          // Check if file exists before attempting to delete
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }

        await dbClient
          .delete(ProfilePicture) // Specify the table to delete from
          .where(eq(ProfilePicture.user_id, Number(userId)))
          .execute();
      }

      // Insert the new profile picture
      await dbClient
        .insert(ProfilePicture)
        .values({
          path: filePath,
          user_id: Number(userId),
          created_at: new Date(),
        })
        .returning({ id: ProfilePicture.id, path: ProfilePicture.path })
        .execute();

      res.json({ filePath });
    } catch (error) {
      console.error("Error saving file path to the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get("/api/profilePic/get", async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const result = await dbClient.query.ProfilePicture.findMany();

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error retrieving images from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.post("/api/cart/add", async (req: Request, res: Response) => {
  const { user_id, photo_id } = req.body;

  if (!photo_id || !user_id) {
    return res.status(400).json({ error: "Photo ID and User ID are required" });
  }

  try {
    // ตรวจสอบว่าผู้ใช้กำลังพยายามเพิ่มรูปของตัวเองหรือไม่
    const photo = await dbClient.query.images.findFirst({
      where: eq(images.id, Number(photo_id)),
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
    let cart: CartType | undefined = await dbClient
      .select()
      .from(carts)
      .where(eq(carts.user_id, Number(user_id)))
      .limit(1)
      .execute()
      .then((result) => result[0]); // ดึงแถวแรกออกมา หรือ undefined ถ้าไม่พบ

    // ถ้าไม่มี cart ให้สร้างใหม่
    if (!cart) {
      const [newCart] = await dbClient
        .insert(carts)
        .values({
          user_id: Number(user_id),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning({
          cart_id: carts.cart_id,
          user_id: carts.user_id,
          created_at: carts.created_at,
          updated_at: carts.updated_at,
        });

      cart = newCart; // ใช้ newCart ที่ดึงมาจากอาร์เรย์
    }

    // เพิ่มรายการใหม่ใน cart_items โดยใช้ cart_id ที่มีอยู่หรือสร้างใหม่
    await dbClient.insert(cart_items).values({
      photo_id: Number(photo_id),
      cart_id: cart.cart_id,
    });

    // อัปเดตเวลาของ cart ในฟิลด์ updated_at
    await dbClient
      .update(carts)
      .set({ updated_at: new Date() })
      .where(eq(carts.cart_id, cart.cart_id));

    res
      .status(201)
      .json({ message: "Item added to cart and cart updated successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/cart/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cart = await dbClient
      .select()
      .from(carts)
      .where(eq(carts.user_id, Number(userId)))
      .limit(1)
      .execute()
      .then((result) => result[0]);

    if (!cart) {
      return res.json([]); // Return an empty array if no cart exists for the user
    }

    const cartItems = await dbClient
      .select({
        id: images.id,
        path: images.path,
        user_id: images.user_id,
        price: images.price,
      })
      .from(cart_items)
      .leftJoin(images, eq(cart_items.photo_id, images.id))
      .where(eq(cart_items.cart_id, cart.cart_id))
      .execute();

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API Endpoint สำหรับการคิดเงินใน Cart
app.post("/api/cart/checkout", async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Find the user's cart
    const cart = await dbClient.query.carts.findFirst({
      where: eq(carts.user_id, Number(user_id)),
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find all items in the user's cart
    const cartItems = await dbClient.query.cart_items.findMany({
      where: eq(cart_items.cart_id, cart.cart_id),
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Process each item in the cart
    await dbClient.transaction(async (trx) => {
      for (const item of cartItems) {
        const photo = await trx.query.images.findFirst({
          where: eq(images.id, item.photo_id),
        });

        if (!photo) {
          throw new Error(`Photo with ID ${item.photo_id} not found`);
        }

        // Check if user can afford the photo
        const buyer = await trx.query.users.findFirst({
          where: eq(users.id, user_id),
        });

        if (!buyer || buyer.coin < photo.price) {
          throw new Error("Insufficient funds");
        }

        const seller = await trx.query.users.findFirst({
          where: eq(users.id, photo.user_id),
        });

        if (!seller) {
          throw new Error(`Seller with ID ${photo.user_id} not found`);
        }

        // Update coins for buyer and seller
        await trx
          .update(users)
          .set({ coin: buyer.coin - photo.price })
          .where(eq(users.id, user_id));
        await trx
          .update(users)
          .set({ coin: seller.coin + photo.price })
          .where(eq(users.id, photo.user_id));

        // Insert ownership record
        await trx.insert(image_ownerships).values({
          user_id: user_id,
          image_id: photo.id,
          purchased_at: new Date(),
        });

        // Insert coin transactions
        await trx.insert(coin_transactions).values({
          user_id: user_id,
          amount: -photo.price,
          transaction_type: "purchase",
          description: `Purchased photo ${photo.id}`,
        });

        await trx.insert(coin_transactions).values({
          user_id: photo.user_id,
          amount: photo.price,
          transaction_type: "sale",
          description: `Sold photo ${photo.id}`,
        });
      }

      // Remove items from the cart
      await trx.delete(cart_items).where(eq(cart_items.cart_id, cart.cart_id));

      // Optionally, remove the cart itself
      await trx.delete(carts).where(eq(carts.cart_id, cart.cart_id));
    });

    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    return res.status(400).json({ error: "Insufficient funds" });
    console.error("Error during checkout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/cart/remove", async (req: Request, res: Response) => {
  const { user_id, photo_id } = req.body;

  if (!photo_id || !user_id) {
    return res.status(400).json({ error: "Photo ID and User ID are required" });
  }

  try {
    // ตรวจสอบว่าผู้ใช้กำลังพยายามลบรูปของตัวเองหรือไม่
    const photo = await dbClient.query.images.findFirst({
      where: eq(images.id, Number(photo_id)),
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    if (photo.user_id === Number(user_id)) {
      return res
        .status(400)
        .json({ error: "Cannot remove your own photo from the cart" });
    }

    // ค้นหา cart ที่มีอยู่แล้วสำหรับ user_id นี้
    let cart: CartType | undefined = await dbClient
      .select()
      .from(carts)
      .where(eq(carts.user_id, Number(user_id)))
      .limit(1)
      .execute()
      .then((result) => result[0]); // ดึงแถวแรกออกมา หรือ undefined ถ้าไม่พบ

    if (!cart) {
      return res.status(404).json({ error: "Cart not found for the user" });
    }

    // ลบรายการจาก cart_items
    const deleteResult = await dbClient
      .delete(cart_items)
      .where(
        and(
          eq(cart_items.photo_id, Number(photo_id)),
          eq(cart_items.cart_id, cart.cart_id)
        )
      )
      .execute();

    if (deleteResult.count === 0) {
      return res.status(404).json({ error: "Item not found in the cart" });
    }

    // อัปเดตเวลาของ cart ในฟิลด์ updated_at
    await dbClient
      .update(carts)
      .set({ updated_at: new Date() })
      .where(eq(carts.cart_id, cart.cart_id));

    res.status(200).json({
      message: "Item removed from cart and cart updated successfully",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// QR Code generation endpoint
app.post("/api/generateQR", async (req: Request, res: Response) => {
  const amount = parseFloat(req.body.amount);
  const mobileNumber = "0885755068";
  const payload = generatePayload(mobileNumber, { amount });
  const option = {
    color: {
      dark: "#000",
      light: "#fff",
    },
  };

  try {
    QRCode.toDataURL(payload, option, (err, url) => {
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
  } catch (error) {
    console.error("Error generating QR Code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/coin/:id", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      userId: user.id,
      coin: user.coin,
    });
  } catch (error) {
    console.error("Error retrieving user coin balance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/coin/transactions/:id", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const transactions = await dbClient.query.coin_transactions.findMany({
      where: eq(coin_transactions.user_id, userId),
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error retrieving user coin transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/photo/:id", async (req: Request, res: Response) => {
  const photoId = parseInt(req.params.id, 10);

  if (isNaN(photoId)) {
    return res.status(400).json({ error: "Invalid photo ID" });
  }

  try {
    const photo = await dbClient.query.images.findFirst({
      where: eq(images.id, photoId),
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photo);
  } catch (error) {
    console.error("Error retrieving photo detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get(
  "/api/photo/:photoId/user/:userId/status",
  async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.photoId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(photoId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid photo ID or user ID" });
    }

    try {
      const ownership = await dbClient.query.image_ownerships.findFirst({
        where: and(
          eq(image_ownerships.user_id, userId),
          eq(image_ownerships.image_id, photoId)
        ),
      });

      res.status(200).json({
        purchased: !!ownership,
      });
    } catch (error) {
      console.error("Error checking purchase status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/api/photo/:photoId/buy", async (req: Request, res: Response) => {
  const photoId = parseInt(req.params.photoId, 10);
  const { userId } = req.body;

  if (isNaN(photoId) || !userId) {
    return res.status(400).json({ error: "Invalid photo ID or user ID" });
  }

  try {
    const photo = await dbClient.query.images.findFirst({
      where: eq(images.id, photoId),
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // ตรวจสอบว่าผู้ใช้กำลังพยายามซื้อรูปของตัวเองหรือไม่
    if (photo.user_id === Number(userId)) {
      return res.status(400).json({ error: "Cannot buy your own photo" });
    }

    const buyer = await dbClient.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!buyer) {
      return res.status(404).json({ error: "User not found" });
    }

    if (buyer.coin < photo.price) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const seller = await dbClient.query.users.findFirst({
      where: eq(users.id, photo.user_id),
    });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    await dbClient.transaction(async (trx) => {
      await trx
        .update(users)
        .set({ coin: buyer.coin - photo.price })
        .where(eq(users.id, userId));
      await trx
        .update(users)
        .set({ coin: seller.coin + photo.price })
        .where(eq(users.id, photo.user_id));

      await trx.insert(image_ownerships).values({
        user_id: userId,
        image_id: photoId,
        purchased_at: new Date(),
      });

      await trx.insert(coin_transactions).values({
        user_id: userId,
        amount: -photo.price,
        transaction_type: "purchase",
        description: `Purchased photo ${photoId}`,
      });

      await trx.insert(coin_transactions).values({
        user_id: photo.user_id,
        amount: photo.price,
        transaction_type: "sale",
        description: `Sold photo ${photoId}`,
      });
    });

    res.status(200).json({ message: "Purchase successful" });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all photos purchased by a specific user
app.get(
  "/api/user/:userId/purchased-photos",
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      // ค้นหารูปภาพที่ผู้ใช้ได้ซื้อ
      const purchasedPhotos = await dbClient
        .select({
          id: images.id,
          path: images.path,
          price: images.price,
          purchased_at: image_ownerships.purchased_at,
        })
        .from(image_ownerships) // หรือตารางที่เก็บข้อมูลการซื้อ
        .leftJoin(images, eq(image_ownerships.image_id, images.id))
        .where(eq(image_ownerships.user_id, Number(userId)))
        .execute();

      if (purchasedPhotos.length === 0) {
        return res.json([]);
      }

      res.json(purchasedPhotos);
    } catch (error) {
      console.error("Error fetching purchased photos:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Endpoint to get user stats
// Get aggregated likes
app.get("/api/getcountlikes", async (req: Request, res: Response) => {
  try {
    const likes = await dbClient.query.likes.findMany();
    console.log("Raw likes data:", likes); // Log raw data for debugging

    const likeCounts = likes.reduce((acc: Record<number, number>, like) => {
      acc[like.user_id] = (acc[like.user_id] || 0) + 1;
      return acc;
    }, {});
    console.log("Aggregated like counts:", likeCounts); // Log aggregated data for debugging

    res.json(likeCounts);
  } catch (error) {
    console.error("Error retrieving likes from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/getreceivedlikes", async (req: Request, res: Response) => {
//   try {
//     const likes = await dbClient.query.likes.findMany();
//     const receivedLikes = likes.reduce((acc: Record<number, number>, like) => {
//       acc[like.user_id] = (acc[like.user_id] || 0) + 1;
//       return acc;
//     }, {});
//     res.json(receivedLikes);
//   } catch (error) {
//     console.error("Error retrieving received likes from the database:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.get("/api/getcountcomments", async (req: Request, res: Response) => {
  try {
    const comments = await dbClient.query.comments.findMany();
    console.log("Raw comments data:", comments); // Log raw data for debugging

    const commentCounts = comments.reduce(
      (acc: Record<number, number>, comment) => {
        acc[comment.user_id] = (acc[comment.user_id] || 0) + 1;
        return acc;
      },
      {}
    );
    console.log("Aggregated comment counts:", commentCounts); // Log aggregated data for debugging

    res.json(commentCounts);
  } catch (error) {
    console.error("Error retrieving comments from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/getreceivedcomments", async (req: Request, res: Response) => {
//   try {
//     const comments = await dbClient.query.comments.findMany();
//     const receivedComments = comments.reduce((acc: Record<number, number>, comment) => {
//       acc[comment.user_id] = (acc[comment.user_id] || 0) + 1;
//       return acc;
//     }, {});
//     res.json(receivedComments);
//   } catch (error) {
//     console.error("Error retrieving received comments from the database:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
