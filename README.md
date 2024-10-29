# FullStack_Project_G5

## Project Overview
This project consists of a full-stack setup using containerized services for the frontend, backend, and database. It is structured to allow efficient development, testing, and deployment.

---

## Table of Contents

1. [Containerization](#containerization)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [Folder Structure](#folder-structure)

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
