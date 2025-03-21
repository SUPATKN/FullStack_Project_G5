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
import passportIns from "./auth/passport";
import QRCode from "qrcode";
import { deleteSession } from "@db/repositories";
import * as useragent from "express-useragent";
import generatePayload from "promptpay-qr";
import { dbClient, dbConn } from "@db/client";
import { randomInt } from "crypto";
import {
  images,
  users,
  likes,
  comments,
  carts,
  cart_items,
  coin_transactions,
  image_ownerships,
  slips,
  orders,
  orders_history,
  albums,
  photo_albums,
  Photo_tags,
  tags,
  withdrwaslips,
  withdraws,
  withdraws_history,
  } from "@db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { param } from "express-validator";
import { ClientRequest } from "http";
import { sql } from 'drizzle-orm';



type CartType = {
  cart_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
};

const app = express();

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
app.use(sessionIns);
app.use(passportIns.initialize());
app.use(passportIns.session());
app.use(useragent.express());

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

//for slip picture
const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../slips"));
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
    const originalName = file.originalname.replace(/\s+/g, "_");
    const newFilename = `${timestamp}-${originalName}`;
    cb(null, newFilename);
  },
});

// ตั้งค่า Multer สำหรับการอัปโหลดไฟล์
const storage4 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../withdrawslips")); // ที่เก็บสลิป
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์ไม่ให้ซ้ำ
  },
});

const upload = multer({ storage: storage1 });
app.use("/api/images", express.static(path.join(__dirname, "../images")));

const upload_profilePic = multer({ storage: storage2 });
app.use(
  "/api/profilePic",
  express.static(path.join(__dirname, "../profile_picture"))
);

const upload_slip = multer({ storage: storage3 });
app.use("/api/slip", express.static(path.join(__dirname, "../slips")));

const withdrawslips = multer({ storage: storage4 });
app.use("/api/slip", express.static(path.join(__dirname, "../withdrawslips")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
//AUTH

app.get("/api/me", async (req, res, next) => {
  const sessions = await formatSession(req);
  const user = req?.user ?? null;
  res.json({ sessions, user });
});

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

    if (email.endsWith("@admin.com")) {
      await dbClient.insert(users).values({
        id: randomInt(1, 1000000),
        username,
        email,
        password: hashedPassword,
        isAdmin: true,
      });
    } else {
      await dbClient.insert(users).values({
        username,
        email,
        password: hashedPassword,
      });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/login", passportIns.authenticate("local"), function (req, res) {
  setSessionInfoAfterLogin(req, "CREDENTIAL");
  res.status(200).json("Login Successful");
});

app.get("/api/logout", function (req, res, next) {
  // req.logout will not delete the session in db. It will generate new one for the already-logout user.
  // When the user login again, it will generate new session with the user id.
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // If you want to delete the session in DB, you can use this function.
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
});

app.get("/api/login/oauth/google", passportIns.authenticate("google"));

app.get(
  "/callback/google",
  passportIns.authenticate("google", {
    failureRedirect: `http://localhost:5899/login`,
  }),
  function (req, res) {
    console.log("----------Callback--------------");
    setSessionInfoAfterLogin(req, "GOOGLE");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5899";
    res.redirect(`http://localhost:5899?login=success`);
  }
);

app.delete("/session", async function (req, res, next) {
  const sid = (req?.query?.sid ?? "") as string;
  const request = await deleteSession(sid);
});

app.post(
  "/api/upload",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const filePath = `/images/${req.file?.filename}`;
    const userId = req.body.user_id;
    const isFree = req.body.isFree === "true"; // Convert string to boolean
    const price = isFree ? 0 : parseInt(req.body.price, 10) || 0; // Default to 0 if free
    const title = req.body.title || ""; // Default to empty string if not provided
    const description = req.body.description || ""; // Default to empty string if not provided
    const maxSales = parseInt(req.body.max_sales, 10) || null; // Convert max_sales to number or default to null
    const tags = req.body.tags;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      console.log("maxSales: ", maxSales);

      const result = await dbClient
        .insert(images)
        .values({
          path: filePath,
          user_id: Number(userId),
          price: price,
          created_at: new Date(),
          title: title,
          max_sales: maxSales,
          description: description,
        })
        .returning({ id: images.id, path: images.path });

      let selectedTags: number[] = [];
      if (tags) {
        if (Array.isArray(tags)) {
          // Multiple tags selected
          selectedTags = tags.map((tagId: string) => parseInt(tagId));
        } else {
          // Single tag selected
          selectedTags = [parseInt(tags)];
        }

        // Insert into Photo_tags table
        for (const tagId of selectedTags) {
          await dbClient
            .insert(Photo_tags)
            .values({
              photo_id: result[0].id,
              tags_id: tagId,
            })
            .execute();
        }
      }

      res.json({ filePath, id: result[0].id });
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
    // fs.unlinkSync(filePath);

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

app.get("/api/user/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, Number(userId)),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarURL: user.avatarURL,
      coin: user.coin,
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
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

// delete comment
app.delete("/api/deletecomment", async (req: Request, res: Response) => {
  const { photo_id, user_id, comment_id } = req.body; // เพิ่ม comment_id

  if (!photo_id || !user_id || !comment_id) {
    return res
      .status(400)
      .json({ error: "Photo ID, User ID, and Comment ID are required" });
  }

  try {
    await dbClient.delete(comments).where(
      and(
        eq(comments.photo_id, Number(photo_id)),
        eq(comments.user_id, Number(user_id)),
        eq(comments.comment_id, Number(comment_id)) // เพิ่มเงื่อนไขการลบตาม comment_id
      )
    );
    res.status(200).json({ message: "comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
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
        .select({
          avatarURL: users.avatarURL,
        })
        .from(users)
        .where(eq(users.id, userId)) // Make sure you check the correct user's profile pic
        .limit(1)
        .execute();

      // If there is an existing profile picture, delete it
      if (existingProfilePic.length > 0) {
        const oldFilePath = existingProfilePic[0].avatarURL;
        const result = oldFilePath?.replace("/api/profilePic/", "");

        if (result) {
          const fullPath = path.join(__dirname, "../profile_picture", result);

          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }

      // Update the new profile picture
      await dbClient
        .update(users)
        .set({
          avatarURL: `/api/profilePic/${filePath}`,
        })
        .where(eq(users.id, userId))
        .execute();

      res.json({ filePath });
    } catch (error) {
      console.error("Error saving file path to the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

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

    if (photo.max_sales !== null && photo.max_sales <= 0) {
      return res
        .status(400)
        .json({ error: "This photo has reached its sales limit" });
    }

        // ตรวจสอบว่าผู้ใช้เคยซื้อรูปภาพนี้แล้วหรือยัง
    const ownership = await dbClient
      .select()
      .from(image_ownerships)
      .where(
        and(
          eq(image_ownerships.user_id, Number(user_id)),
          eq(image_ownerships.image_id, Number(photo_id))
        )
      )
      .limit(1)
      .execute()
      .then((result) => result[0]);

    if (ownership) {
      return res
        .status(400)
        .json({ error: "You already own this photo, cannot add to cart" });
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

    res.sendStatus(201); // ส่งสถานะ 201 โดยไม่มีข้อความเพิ่มเติม

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

        if (photo.max_sales !== null && photo.max_sales <= 0) {
          return res
            .status(400)
            .json({ error: "This photo has reached its sales limit" });
        }

        // ลดค่า max_sales ลง 1
        if (photo.max_sales !== null) {
          await trx
            .update(images)
            .set({ max_sales: photo.max_sales - 1 })
            .where(eq(images.id, photo.id));
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
          path: photo.path,
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

    // ตรวจสอบว่า max_sales ยังมีค่ามากกว่า 0 หรือไม่
    if (photo.max_sales !== null && photo.max_sales <= 0) {
      return res
        .status(400)
        .json({ error: "This photo has reached its sales limit" });
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
        path:photo.path,
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

      // ลดค่า max_sales ลง 1
      if (photo.max_sales !== null) {
        await trx
          .update(images)
          .set({ max_sales: photo.max_sales - 1 })
          .where(eq(images.id, photoId));
      }
    });

    res.status(200).json({ message: "Purchase successful" });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all photos purchased by a specific user
app.get("/api/user/:userId/purchased-photos", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // ค้นหารูปภาพที่ผู้ใช้ได้ซื้อพร้อมชื่อผู้ขาย
    const purchasedPhotos = await dbClient
      .select({
        id: image_ownerships.id,
        path: image_ownerships.path,
        price: images.price,
        title: images.title,
        image_id: image_ownerships.image_id,
        purchased_at: image_ownerships.purchased_at,
        sellerName: users.username,  // เพิ่มฟิลด์ username ของผู้ขาย
      })
      .from(image_ownerships) 
      .leftJoin(images, eq(image_ownerships.image_id, images.id))
      .leftJoin(users, eq(images.user_id, users.id)) 
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
});


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

app.post("/api/selectPriceAndQuantity", async (req, res) => {
  const { price, quantity, user_id } = req.body;

  console.log("Price:", price);
  console.log("Quantity:", quantity);
  console.log("User_Id:", user_id);

  try {
    // Convert price to string if necessary
    const formattedPrice = parseFloat(price).toFixed(2); // Format price as a decimal with 2 places

    await dbClient.insert(orders).values({
      user_id: Number(user_id),
      price: formattedPrice, // Keep price as a string in decimal format
      quantity: Number(quantity),
      status: "pending",
      created_at: new Date(),
    });

    res.status(201).json({ message: "Orders added successfully" });
  } catch (error) {
    console.error("Error inserting order into the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle slip upload
app.post(
  "/api/uploadSlip",
  upload_slip.single("slip"),
  async (req: Request, res: Response) => {
    const filePath = req.file?.filename;
    const { amount, coins, user_id } = req.body;
    console.log("Prcie: ", coins);

    // Validate inputs
    if (!filePath) {
      return res
        .status(400)
        .json({ success: false, message: "File upload failed" });
    }

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    try {
      // Check if a slip already exists for the user
      const existingSlip = await dbClient
        .select()
        .from(slips)
        .where(eq(slips.user_id, Number(user_id)))
        .limit(1)
        .execute();

      // If there is an existing slip, delete it
      if (existingSlip.length > 0) {
        const oldFilePath = existingSlip[0].slip_path; // Access the path from the result

        if (oldFilePath) {
          const fullPath = path.join(__dirname, "../slips", oldFilePath);

          // Check if file exists before attempting to delete
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }

        // Delete the old slip record from the database
        await dbClient
          .delete(slips)
          .where(eq(slips.user_id, Number(user_id)))
          .execute();
      }

      // Insert the new slip record into the database
      const result = await dbClient
        .insert(slips)
        .values({
          user_id: Number(user_id), // Ensure user_id is a number
          amount: parseInt(amount, 10), // Ensure amount is an integer
          coins: parseInt(coins, 10), // Convert price to string for insertion
          slip_path: filePath, // File path for uploaded slip
          status: "pending", // Default status is pending
          created_at: new Date(), // Timestamp when slip is created
          updated_at: new Date(), // Timestamp when slip is updated
          admin_note: "up slip", // Default admin note
        })
        .returning({ slip_id: slips.slip_id, slip_path: slips.slip_path })
        .execute();

      // Respond with the new file path
      res.json({
        success: true,
        slipId: result[0].slip_id,
        filePath: result[0].slip_path,
      });
    } catch (error) {
      console.error("Error saving file path to the database:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

app.get("/api/slips/get", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.slips.findMany();

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error retrieving images from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/slips", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.slips.findMany();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving images from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/slips/:slipId", async (req: Request, res: Response) => {
  const slipId = parseInt(req.params.slipId, 10);

  if (isNaN(slipId)) {
    return res.status(400).json({ error: "Invalid slip ID" });
  }

  try {
    const slip = await dbClient.query.slips.findFirst({
      where: eq(slips.slip_id, slipId),
    });

    if (!slip) {
      return res.status(404).json({ error: "Slip not found" });
    }

    res.status(200).json(slip);
  } catch (error) {
    console.error("Error retrieving slip details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Approve Slip
app.post("/api/slips/approve/:slipId", async (req: Request, res: Response) => {
  const slipId = parseInt(req.params.slipId, 10);

  if (isNaN(slipId)) {
    return res.status(400).json({ error: "Invalid slip ID" });
  }

  try {
    // Fetch the slip
    const slip = await dbClient.query.slips.findFirst({
      where: eq(slips.slip_id, slipId),
    });

    if (!slip || slip.status !== "pending") {
      return res
        .status(404)
        .json({ error: "Slip not found or already processed" });
    }

    // Fetch the user
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, slip.user_id),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the associated order
    const order = await dbClient.query.orders.findFirst({
      where: eq(orders.user_id, slip.user_id),
      // Assumes you want the latest order, adjust if needed
      // orderBy: { created_at: "desc" },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update user coins based on the approved slip
    await dbClient
      .update(users)
      .set({ coin: user.coin + slip.coins })
      .where(eq(users.id, slip.user_id))
      .execute();

    // Insert the order into orders_history
    await dbClient
      .insert(orders_history)
      .values({
        user_id: slip.user_id,
        order_id: order.order_id,
        coins: slip.coins,
        price: slip.amount,
        status: "Approved",
        create_at: new Date(),
      })
      .execute();

    // Delete the slip after approving
    await dbClient.delete(slips).where(eq(slips.slip_id, slipId)).execute();

    res
      .status(200)
      .json({ message: "Slip approved, coins added, and order recorded" });
  } catch (error) {
    console.error("Error approving slip:", error);
    res.status(500).json({ error: "Failed to approve slip" });
  }
});

// Reject Slip
app.post("/api/slips/reject/:slipId", async (req: Request, res: Response) => {
  const slipId = parseInt(req.params.slipId, 10);

  if (isNaN(slipId)) {
    return res.status(400).json({ error: "Invalid slip ID" });
  }

  try {
    // Fetch the slip
    const slip = await dbClient.query.slips.findFirst({
      where: eq(slips.slip_id, slipId),
    });

    if (!slip || slip.status !== "pending") {
      return res
        .status(404)
        .json({ error: "Slip not found or already processed" });
    }

    // Fetch the user
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, slip.user_id),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the associated order
    const order = await dbClient.query.orders.findFirst({
      where: eq(orders.user_id, slip.user_id),
      // Assumes you want the latest order, adjust if needed
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Insert the order into orders_history with status "rejected"
    await dbClient
      .insert(orders_history)
      .values({
        user_id: slip.user_id,
        order_id: order.order_id, // Use the found order_id
        coins: slip.coins,
        price: slip.amount, // Assuming slip.amount corresponds to the price
        status: "Rejected",
        create_at: new Date(), // or use timestamp if preferred
      })
      .execute();

    // Delete the slip upon rejection
    await dbClient.delete(slips).where(eq(slips.slip_id, slipId)).execute();

    res
      .status(200)
      .json({ message: "Slip rejected, order recorded in history" });
  } catch (error) {
    console.error("Error rejecting slip:", error);
    res.status(500).json({ error: "Failed to reject slip" });
  }
});

// Endpoint สำหรับดึงประวัติของคำสั่งซื้อ
app.get("/api/orders/history", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ดึงรายการคำสั่งซื้อของผู้ใช้จากฐานข้อมูล
    const ordersHistory = await dbClient
      .select()
      .from(orders_history)
      .where(eq(orders_history.user_id, Number(user_id)))
      .orderBy(orders_history.create_at)
      .execute();

    res.status(200).json(ordersHistory);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/create_album", async (req: Request, res: Response) => {
  const { user_id, title, description } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // รอให้ insert สำเร็จ
    await dbClient.insert(albums).values({
      user_id: user_id,
      title: title,
      description: description,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ส่ง response กลับไปหากสำเร็จ
    res.status(200).json({ message: "Album created successfully" });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/album/:albumId", async (req: Request, res: Response) => {
  const { albumId } = req.params;

  if (!albumId) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  try {
    // ดึงข้อมูล album จากฐานข้อมูล
    const albumsForUser = await dbClient
      .select()
      .from(albums)
      .where(eq(albums.album_id, Number(albumId))) // ใช้ albumId เป็น id ของ album
      .execute();

    if (albumsForUser.length === 0) {
      return res.status(404).json({ error: "No album found with this ID" });
    }

    // ส่งข้อมูลของ album กลับไป
    const album = albumsForUser[0];
    res.status(200).json({
      title: album.title,
      description: album.description,
    });
  } catch (error) {
    console.error("Error fetching album details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/album/:album_id", async (req: Request, res: Response) => {
  const { album_id } = req.params;

  if (!album_id) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  try {
    const result = await dbClient
      .delete(albums)
      .where(eq(albums.album_id, Number(album_id)))
      .execute();

    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/album/add_photo", async (req: Request, res: Response) => {
  const { album_id, photo_id } = req.body;

  if (!album_id || !photo_id) {
    return res
      .status(400)
      .json({ error: "Album ID and Photo ID are required" });
  }

  try {
    // Check if the photo is already in the album
    const existingPhotoInAlbum = await dbClient
      .select()
      .from(photo_albums)
      .where(
        and(
          eq(photo_albums.album_id, Number(album_id)),
          eq(photo_albums.photo_id, Number(photo_id))
        )
      )
      .execute();

    if (existingPhotoInAlbum.length > 0) {
      return res
        .status(409)
        .json({ error: "Photo already exists in this album" });
    }

    // If the photo is not in the album, insert it
    await dbClient.insert(photo_albums).values({
      photo_id: Number(photo_id),
      album_id: Number(album_id),
    });

    res.status(200).json({ message: "Photo added to album successfully" });
  } catch (error) {
    console.error("Error adding photo to album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/album/:album_id/photos", async (req: Request, res: Response) => {
  const { album_id } = req.params;

  console.log(album_id);

  if (!album_id) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  try {
    const albumPhotos = await dbClient
      .select({
        id: images.id,
        path: images.path,
        user_id: images.user_id,
        price: images.price,
        title: images.title,
        description: images.description,
        created_at: images.created_at,
      })
      .from(photo_albums)
      .where(eq(photo_albums.album_id, Number(album_id)))
      .innerJoin(images, eq(photo_albums.photo_id, images.id))
      .execute();

    if (albumPhotos.length === 0) {
      return res.status(404).json({ message: "No photos found in this album" });
    }

    res.status(200).json(albumPhotos);
  } catch (error) {
    console.error("Error fetching album photos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/transactions", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ดึงรายการคำสั่งซื้อของผู้ใช้จากฐานข้อมูล
    const transections = await dbClient
      .select()
      .from(coin_transactions)
      .where(eq(coin_transactions.user_id, Number(user_id)))
      .orderBy(coin_transactions.created_at)
      .execute();

    res.status(200).json(transections);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/create_album", async (req: Request, res: Response) => {
  const { user_id, title, description } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // รอให้ insert สำเร็จ
    await dbClient.insert(albums).values({
      user_id: user_id,
      title: title,
      description: description,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ส่ง response กลับไปหากสำเร็จ
    res.status(200).json({ message: "Album created successfully" });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/albums/:user_id", async (req: Request, res: Response) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const userAlbums = await dbClient
      .select()
      .from(albums)
      .where(eq(albums.user_id, Number(user_id)))
      .execute();

    // Return an empty array if no albums are found
    res.status(200).json(userAlbums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/album/:album_id", async (req: Request, res: Response) => {
  const { album_id } = req.params;

  if (!album_id) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  try {
    const result = await dbClient
      .delete(albums)
      .where(eq(albums.album_id, Number(album_id)))
      .execute();

    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/album/add_photo", async (req: Request, res: Response) => {
  const { album_id, photo_id } = req.body;

  if (!album_id || !photo_id) {
    return res
      .status(400)
      .json({ error: "Album ID and Photo ID are required" });
  }

  try {
    // Check if the photo is already in the album
    const existingPhotoInAlbum = await dbClient
      .select()
      .from(photo_albums)
      .where(
        and(
          eq(photo_albums.album_id, Number(album_id)),
          eq(photo_albums.photo_id, Number(photo_id))
        )
      )
      .execute();

    if (existingPhotoInAlbum.length > 0) {
      return res
        .status(409)
        .json({ error: "Photo already exists in this album" });
    }

    // If the photo is not in the album, insert it
    await dbClient.insert(photo_albums).values({
      photo_id: Number(photo_id),
      album_id: Number(album_id),
    });

    res.status(200).json({ message: "Photo added to album successfully" });
  } catch (error) {
    console.error("Error adding photo to album:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/album/:album_id/photos", async (req: Request, res: Response) => {
  const { album_id } = req.params;

  console.log(album_id);

  if (!album_id) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  try {
    const albumPhotos = await dbClient
      .select({
        id: images.id,
        path: images.path,
        user_id: images.user_id,
        price: images.price,
        created_at: images.created_at,
      })
      .from(photo_albums)
      .where(eq(photo_albums.album_id, Number(album_id)))
      .innerJoin(images, eq(photo_albums.photo_id, images.id))
      .execute();

    if (albumPhotos.length === 0) {
      return res.status(404).json({ message: "No photos found in this album" });
    }

    res.status(200).json(albumPhotos);
  } catch (error) {
    console.error("Error fetching album photos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/transactions", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ดึงรายการคำสั่งซื้อของผู้ใช้จากฐานข้อมูล
    const transections = await dbClient
      .select()
      .from(coin_transactions)
      .where(eq(coin_transactions.user_id, Number(user_id)))
      .orderBy(coin_transactions.created_at)
      .execute();

    res.status(200).json(transections);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/tag", async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Tag name requied!" });
  }

  const existingTag = await dbClient
    .select()
    .from(tags)
    .where(eq(tags.name, name))
    .execute();

  if (existingTag.length > 0) {
    return res.status(409).json({ error: "Tag already exists in this album" });
  }

  try {
    await dbClient.insert(tags).values({
      name: name,
    });
    res.status(200).json({ message: "tag created successfully" });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get all tags
app.get("/api/tag", async (req: Request, res: Response) => {
  try {
    const allTag = await dbClient.query.tags.findMany();
    res.status(200).json(allTag);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/tag", async (req: Request, res: Response) => {
  const { tag_id } = req.body;

  try {
    await dbClient.delete(tags).where(eq(tags.tags_id, Number(tag_id)));
    res.status(200).json({ message: "Tag removed successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/photo/:photoId/tags", async (req, res) => {
  const { photoId } = req.params;
  console.log("photoId:", photoId);
  try {
    const Tag = await dbClient
      .select({ name: tags.name })
      .from(Photo_tags)
      .innerJoin(tags, eq(Photo_tags.tags_id, tags.tags_id))
      .where(eq(Photo_tags.photo_id, parseInt(photoId)));

    res.json(Tag);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tags" });
  }
});


app.get("/api/photos/search", async (req: Request, res: Response) => {
  const { title } = req.query;

  // ตรวจสอบว่า title มีค่าและเป็น string
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: "Title query parameter is required" });
  }

  try {
    const lowerCaseTitle = title.toLowerCase();

    const photos = await dbClient.query.images.findMany({
      where: sql`LOWER(${images.title}) LIKE ${'%' + lowerCaseTitle + '%'}` 
    });
    

    console.log("Photos found for title:", title, photos);

    if (photos.length === 0) {
      return res.status(404).json({ error: "No photos found" });
    }

    res.status(200).json(photos); // ส่งคืนอาเรย์ของรูปภาพ
  } catch (error) {
    console.error("Error searching photos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/photo/:photoId/tags", async (req, res) => {
//   const { photoId } = req.params;  // Extract the photo ID from the request parameters

//   try {
//     // Ensure that the photoId is a valid number
//     const parsedPhotoId = parseInt(photoId);
//     if (isNaN(parsedPhotoId)) {
//       return res.status(400).json({ error: "Invalid photo ID" });
//     }

//     // Query to fetch tag names associated with a specific photo
//     const tagsForPhoto = await dbClient
//       .select({
//         tagName: tags.name,       // Select the 'name' field from 'tags' table
//       })
//       .from(Photo_tags)            // Start from the 'Photo_tags' table
//       .innerJoin(tags, eq(Photo_tags.tags_id, tags.tags_id))  // Join with 'tags' table
//       .where(eq(Photo_tags.photo_id, parsedPhotoId))          // Filter by the given 'photo_id'
//       .execute();  // Execute the query

//     // Return the result as JSON
//     res.status(200).json(tagsForPhoto);
//   } catch (error) {
//     console.error("Error fetching tags for photo:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


app.get("/api/photo/tag/:tagId", async (req, res) => {
  const { tagId } = req.params;
  try {
    const photos = await dbClient
      .select({
        id: images.id,
        path: images.path,
        user_id: images.user_id,
        created_at: images.created_at,
        price: images.price,
        title: images.title,
        max_sales: images.max_sales,
        description: images.description,
      })
      .from(images)
      .innerJoin(Photo_tags, eq(images.id, Photo_tags.photo_id))
      .where(eq(Photo_tags.tags_id, parseInt(tagId)))
      .execute();

    console.log("PHOTO:", photos);
    res.json(photos);
  } catch (error) {
    console.error("Error fetching photos by tag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/withdrawals/upload",
  withdrawslips.single("slip"),
  async (req: Request, res: Response) => {
    const filePath = req.file?.filename;
    const { amount, coins, user_id } = req.body;

  console.log("Received data:");
    console.log("File Path:", filePath);
    console.log("Amount:", amount);
    console.log("Coins:", coins);
    console.log("User ID:", user_id);

    // Validate required inputs
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "File upload failed. Please provide a valid file.",
      });
    }

    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({
        success: false,
        message: "User ID is required and must be a valid number.",
      });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be a positive number.",
      });
    }

    if (!coins || isNaN(Number(coins)) || Number(coins) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coins value is required and must be a positive number.",
      });
    }

    try {
      // Check if a previous withdrawal slip exists for this user
      const existingWithdrawal = await dbClient
        .select()
        .from(withdrwaslips)
        .where(eq(withdrwaslips.user_id, Number(user_id)))
        .limit(1)
        .execute();

      // If a previous slip exists, delete the old file and its record
      if (existingWithdrawal.length > 0) {
        const oldFilePath = existingWithdrawal[0].slip_path;

        if (oldFilePath) {
          const fullPath = path.join(__dirname, "../withdrawslips", oldFilePath);

          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath); // Remove the old slip file
            }
          } catch (error) {
            console.error("Error deleting old slip file:", error);
          }
        }

        const formattedPrice = parseFloat(amount).toFixed(2); // Format price as a decimal with 2 places

    await dbClient.insert(withdraws).values({
      user_id: Number(user_id),
      price: formattedPrice, // Keep price as a string in decimal format
      quantity: Number(coins),
      status: "pending",
      created_at: new Date(),
    });

        // Delete the previous slip record from the database
        await dbClient
          .delete(withdrwaslips)
          .where(eq(withdrwaslips.user_id, Number(user_id)))
          .execute();
      }

      // Insert the new withdrawal slip record into the database
      const result = await dbClient
        .insert(withdrwaslips)
        .values({
          user_id: Number(user_id),
          amount: parseInt(amount, 10),
          coins: parseInt(coins, 10),
          slip_path: filePath,
          status: "pending", // Initial status
          created_at: new Date(),
          updated_at: new Date(),
          admin_note: "up slip", // Initial admin note
        })
        .returning({ slip_id: withdrwaslips.slip_id, slip_path: withdrwaslips.slip_path })
        .execute();

      // Respond with success and the new slip details
      res.json({
        success: true,
        slipId: result[0].slip_id,
        filePath: result[0].slip_path,
      });
    } catch (error) {
      console.error("Error saving withdrawal slip path to the database:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred while processing your request.",
      });
    }
  }
);


app.get("/api/wirhdrawslips/get", async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.withdrwaslips.findMany();

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error retrieving images from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// app.get("/api/wirhdrawslips", async (req: Request, res: Response) => {
//   try {
//     const result = await dbClient.query.withdrwaslips.findMany();
//     res.json(result);
//   } catch (error) {
//     console.error("Error retrieving images from the database:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/api/withdrawslips/approve/:slipId", async (req: Request, res: Response) => {
  const slipId = parseInt(req.params.slipId, 10);

  console.log("Received slip ID from params:", req.params.slipId);
  if (isNaN(slipId)) {
    return res.status(400).json({ error: "Invalid slip ID" });
  }

  try {
    // Fetch the slip
    const slip = await dbClient.query.withdrwaslips.findFirst({
      where: eq(withdrwaslips.slip_id, slipId),
    });

    if (!slip || slip.status !== "pending") {
      return res
        .status(404)
        .json({ error: "Slip not found or already processed" });
    }
    console.log("Slip found:", slip);

    // Fetch the user
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, slip.user_id),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Fetched user:", user);

    // Check if the user has enough coins to withdraw
    

    // Fetch the associated order
    const withdraw = await dbClient.query.withdraws.findFirst({
      where: eq(withdraws.user_id, slip.user_id),
    });

    if (!withdraw) {
      return res.status(404).json({ error: "Order not found" });
    }
    console.log("Fetched withdraw:", withdraw);

    // Update user coins based on the approved slip
    try {
      await dbClient
        .update(users)
        .set({ coin: user.coin - slip.coins })
        .where(eq(users.id, slip.user_id))
        .execute();
      console.log("User coins updated successfully");
    } catch (updateError) {
      console.error("Failed to update user coins:", updateError);
      return res.status(500).json({ error: "Failed to update user coins" });
    }

    // Insert the order into orders_history
    try {
      await dbClient
        .insert(withdraws_history)
        .values({
          user_id: slip.user_id,
          withdraw_id: withdraw.withdraw_id,
          coins: slip.coins,
          price: slip.amount,
          status: "Approved",
          create_at: new Date(),
        })
        .execute();
      console.log("Order recorded successfully");
    } catch (historyError) {
      console.error("Failed to insert into withdraws_history:", historyError);
      return res.status(500).json({ error: "Failed to record the order" });
    }

    // Delete the slip after approving
    try {
      await dbClient
        .delete(withdrwaslips)
        .where(eq(withdrwaslips.slip_id, slipId))
        .execute();
      console.log("Slip deleted successfully");
    } catch (deleteError) {
      console.error("Failed to delete slip:", deleteError);
      return res.status(500).json({ error: "Failed to delete slip" });
    }

    res.status(200).json({
      message: "Slip approved, coins deducted, and order recorded",
    });
  } catch (error) {
    console.error("Error approving slip:", error);
    res.status(500).json({ error: "Failed to approve slip" });
  }
});


app.get("/api/withdraw/history", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ดึงรายการคำสั่งซื้อของผู้ใช้จากฐานข้อมูล
    const withdrawHistory = await dbClient
      .select()
      .from(withdraws_history)
      .where(eq(withdraws_history.user_id, Number(user_id)))
      .orderBy(withdraws_history.create_at)
      .execute();

    res.status(200).json(withdrawHistory);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});