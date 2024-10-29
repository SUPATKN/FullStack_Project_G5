# FullStack Project G5

## Project Overview
This project consists of a full-stack setup using containerized services for the frontend, backend, and database. It is structured to allow efficient development, testing, and deployment.

---

## Table of Contents

1. [Containerization](#containerization)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [API Endpoints](#api-endpoints)
6. [Folder Structure](#folder-structure)

---

### Containerization

To spin up the containerized environments, use the following commands.

- **Frontend & Database**  
    ```bash
    docker compose --env-file ./.env.test up -d --force-recreate --build
    ```

- **Backend**  
    ```bash
    docker compose -f docker-compose-backend.yml --env-file ./.env.test up -d --force-recreate --build
    ```

---

### Frontend Setup

1. **Setup**  
   - Install dependencies:
      ```bash
      npm install
      ```
   - Start the development server:
      ```bash
      npm run dev
      ```
   - Build the project for production:
      ```bash
      npm run build
      ```

2. **Environment Configuration**  
   - Create an `.env.test` file from the `.env.example` file.

---

### Backend Setup

1. **Environment Configuration**  
   - Create an `.env.test` file from the `.env.example` file.

2. **Setup**  
   - Install dependencies:
      ```bash
      npm install
      ```

3. **Sync Database**  
   - Push changes to the database:
      ```bash
      npm run db:push
      ```
   - Run migrations:
      ```bash
      npm run db:generate
      npm run db:migrate
      ```

4. **Development Operations**  
   - Start the development server:
      ```bash
      npm run dev
      ```
   - Build the backend for production:
      ```bash
      npm run build
      ```
   - Start the backend in production:
      ```bash
      npm run start
      ```

---

### Database Setup

1. **Environment Configuration**  
   - Create an `.env` file from the `.env.example` file.

2. **Start Database**  
   - Run the following command to start the database container:
      ```bash
      docker compose up -d
      ```

3. **User Management**  
   - Access the PostgreSQL shell:
      ```bash
      docker exec -it art-database bash
      psql -U postgres -d mydb
      ```
   - Update the user and permissions:
      ```sql
      REVOKE CONNECT ON DATABASE mydb FROM public;
      REVOKE ALL ON SCHEMA public FROM PUBLIC;
      CREATE USER appuser WITH PASSWORD '1234';
      CREATE SCHEMA drizzle;
      GRANT ALL ON DATABASE mydb TO appuser;
      GRANT ALL ON SCHEMA public TO appuser;
      GRANT ALL ON SCHEMA drizzle TO appuser;
      ```

---

### API Endpoints

#### User Authentication

- **GET** `/api/me`: Retrieve current session data and logged-in user information, if available.
- **POST** `/api/register`: Register a new user with username, email, and password, checking for existing email.
- **POST** `/api/login`: Log in user using Local Authentication via Passport.
- **GET** `/api/logout`: Log out user and destroy the current session.
- **GET** `/api/login/oauth/google`: Initiate Google OAuth login process.
- **GET** `/callback/google`: Redirect after Google login, redirecting back to the website upon successful login.
- **DELETE** `/session`: Delete session from the system using the provided sid.

#### Photo Management

- **POST** `/api/upload`: Upload images with additional data (user_id, isFree, price, title, description, max_sales, tags) and save to the database.
- **GET** `/api/photo`: Retrieve all images from the database.
- **DELETE** `/api/photo/:filename`: Delete an image file by filename and remove its data from the database.
- **GET** `/api/photo/user/status`: Check the purchase status of an image by the user.
- **POST** `/api/photo/buy`: Purchase an image by its ID and the buyer's ID.

#### Like and Comment Management

- **POST** `/api/likes`: Add a "like" to an image by specifying photo_id and user_id.
- **DELETE** `/api/unlikes`: Remove a "like" by specifying photo_id and user_id.
- **GET** `/api/getlikes`: Retrieve all "likes" data from the database.
- **POST** `/api/comments`: Add a comment to an image by specifying photo_id, user_id, and content.
- **DELETE** `/api/deletecomment`: Delete a comment by specifying photo_id, user_id, and comment_id.
- **GET** `/api/getcomments`: Retrieve all comments from the database.

#### Profile and Cart Management

- **POST** `/api/profilePic/upload`: Upload a new profile picture and remove the old one (if any), saving the image URL in the database.
- **POST** `/api/cart/add`: Add an image to the user's cart, ensuring it is not their own image or one that has reached max sales.
- **GET** `/api/cart/`: Retrieve all items in the user's cart by the specified user_id.
- **POST** `/api/cart/checkout`: Process payment for items in the cart, updating balances for buyer and seller, and creating a transaction record.
- **DELETE** `/api/cart/remove`: Remove an item from the user's cart by specifying photo_id and user_id.

#### QR Code Generation and Coin Management

- **POST** `/api/generateQR`: Create a QR Code for a specified amount using a mobile phone number.
- **GET** `/api/coin/`: Retrieve coin balance for the user by their ID.
- **GET** `/api/coin/transactions/`: Retrieve the user's coin transaction history by their ID.

#### Transaction and Album Management

- **GET** `/api/orders/history`: Retrieve the order history for the user by specifying user_id in the query string.
- **POST** `/api/create_album`: Create a new album for the user by specifying user_id, title, and description in the body.
- **GET** `/api/album/`: Retrieve album details by specifying albumId in the URL.
- **DELETE** `/api/album/`: Delete the specified album by album_id.
- **POST** `/api/album/add_photo`: Add an image to the specified album by providing album_id and photo_id in the body.
- **GET** `/api/album/photos`: Retrieve all images in the album by specifying album_id in the URL.

#### Tag Management

- **POST** `/api/tag`: Create a new tag by specifying the name in the body and check if the tag already exists.
- **GET** `/api/tag`: Retrieve all tags currently in the system.
- **DELETE** `/api/tag`: Delete a tag by specifying tag_id in the body.

#### Withdrawals Management

- **POST** `/api/withdrawals/upload`: Upload a withdrawal slip and save withdrawal data in the database.
- **GET** `/api/withdrawslips/get`: Retrieve all withdrawal slips from the database.
- **POST** `/api/withdrawslips/approve/`: Approve a withdrawal slip and update the user's balance.
- **POST** `/api/withdrawslips/reject/`: Reject a withdrawal slip, logging the reason and removing it from the database.
- **POST** `/api/selectedwithdraw`: Add a new withdrawal request directly to the database.
- **GET** `/api/withdraw/history`: Retrieve the user's withdrawal history by specifying user_id.

---

### Folder Structure

A brief overview of the important folders in the project repository:

- **`frontend`**: Contains all frontend-related files.
    - **`frontend/src/admin`**: Development files for the admin panel.
    - **`frontend/src/hook`**: Essential hooks used in the frontend.
    - **`frontend/src/page`**: Each frontend page's code is stored here.

- **`my-app`**: Contains backend-related files, including the database.
    - **`my-app/src/auth`**: Handles authentication and authorization logic.
    - **`my-app/src/type`**: Stores various type definitions used in the backend.
    - **`my-app/src/index.ts`**: Entry point for the backend server.

- **`testing`**: Contains testing files for the project.

--- 

This README should help get new developers up and running with the project quickly.
