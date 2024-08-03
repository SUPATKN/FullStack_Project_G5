import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import { hash, compare } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { dbClient, dbConn } from '@db/client';
import { images, users } from '@db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';


const app = express();

app.use(
  cors({
    origin: 'http://localhost:5899', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '');
    const originalName = file.originalname.replace(/\s+/g, '_');
    const newFilename = `${timestamp}-${originalName}`;
    cb(null, newFilename);
  }
});

const upload = multer({ storage });
app.use('/api/images', express.static(path.join(__dirname, '../images')));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// app.post('/api/upload', upload.single('image'), async (req: Request, res: Response) => {
//   const filePath = `/images/${req.file?.filename}`;
//   const userId = req.body.userId; 

//   if (!userId) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }

//   try {
//     await dbClient.insert(images).values({
//       path: filePath,
//       user_id: Number(userId) // Ensure the user_id is of the correct type
//     });
//     res.json({ filePath });
//   } catch (error) {
//     console.error('Error saving file path to the database:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post("/api/upload", upload.single("image"), async (req: any, res: any) => {
// const filePath = `/images/${req.file.filename}`;  try {
// const userId = req.body.userId;

//   if (!userId) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }

//     const result = await dbClient
//       .insert(images)
//       .values({ path: filePath ,user_id: Number(userId)})
//       .returning({ id: images.id, path: images.path });
//     res.json({ filePath });
//   } catch (error) {
//     console.error("Error saving file path to the database:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/api/upload", upload.single("image"), async (req: any, res: any) => {
const filePath = `/images/${req.file.filename}`;  try {
    const result = await dbClient
      .insert(images)
      .values({ path: filePath })
      .returning({ id: images.id, path: images.path });
    res.json({ filePath });
  } catch (error) {
    console.error("Error saving file path to the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.post('/api/upload', upload.single('image'), async (req: Request, res: Response) => {
//   const filePath = `/images/${req.file?.filename}`;
//   const userId = req.body.userId;

//   if (!userId) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }

//   try {
//     await dbClient.insert(images).values({
//       path: filePath,
//       user_id: Number(userId) // Ensure the user_id is provided and correctly typed
//     });
//     res.json({ filePath });
//   } catch (error) {
//     console.error('Error saving file path to the database:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


app.get('/api/photo', async (req: Request, res: Response) => {
  try {
    const result = await dbClient.query.images.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error retrieving images from the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/photo/:filename', async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../images', filename);
  
  try {
    fs.unlinkSync(filePath);

    const results = await dbClient.query.images.findMany();
    if (results.length === 0) {
      dbConn.end();
      res.status(404).json({ message: 'File not found in database' });
      return;
    }

    const id = results[0].id;
    await dbClient.delete(images).where(eq(images.id, id));

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await dbClient.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const hashedPassword = await hash(password, 10);

    await dbClient.insert(users).values({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await dbClient.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, Number(userId))
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Error retrieving user information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as { userId: number };
    const user = await dbClient.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
