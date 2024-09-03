import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { dbClient, dbConn } from "@db/client";
import { images, users, likes, comments } from "@db/schema";
import { and, eq } from "drizzle-orm";

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
  })
);

app.use(helmet());
app.use(express.json());

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// app.post(
//   "/api/upload",
//   upload.single("image"),
//   async (req: Request, res: Response) => {
//     const filePath = `/images/${req.file?.filename}`;
//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required" });
//     }

//     try {
//       await dbClient.insert(images).values({
//         path: filePath,
//         user_id: Number(userId), // Ensure the user_id is of the correct type
//       });
//       res.json({ filePath });
//     } catch (error) {
//       console.error("Error saving file path to the database:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

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
    const hashedPassword = await hash(password, 10);

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

app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await dbClient.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, "YOUR_SECRET_KEY", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      accessToken: token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
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
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/profile", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "YOUR_SECRET_KEY") as { userId: number };
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, decoded.userId),
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

app.post('/api/generateQR', async (req: Request, res: Response) => {
  const amount = parseFloat(req.body.amount); // Get amount from request body
  const mobileNumber = '0885755068';
  const payload = generatePayload(mobileNumber, { amount });
  const option = {
    color: {
      dark: '#000',
      light: '#fff'
    }
  };

  try {
    QRCode.toDataURL(payload, option, (err, url) => {
      if (err) {
        console.error('QR Code generation failed:', err);
        return res.status(400).json({
          RespCode: 400,
          RespMessage: 'QR Code generation failed: ' + err.message
        });
      }
      res.status(200).json({
        RespCode: 200,
        RespMessage: 'QR Code generated successfully',
        Result: url
      });
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// QR Code generation endpoint
app.post('/api/generateQR', async (req: Request, res: Response) => {
  const amount = parseFloat(req.body.amount);
  const mobileNumber = '0885755068';
  const payload = generatePayload(mobileNumber, { amount });
  const option = {
    color: {
      dark: '#000',
      light: '#fff'
    }
  };

  try {
    QRCode.toDataURL(payload, option, (err, url) => {
      if (err) {
        console.error('QR Code generation failed:', err);
        return res.status(400).json({
          RespCode: 400,
          RespMessage: 'QR Code generation failed: ' + err.message
        });
      }
      res.status(200).json({
        RespCode: 200,
        RespMessage: 'QR Code generated successfully',
        Result: url
      });
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});