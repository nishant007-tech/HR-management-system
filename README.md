# User-management

It's User Management System.

## Table of Contents

- [Features](#features)
- [Installation](#installation)

## Features

- View all users in admin dashboard.
- SuperAdmin can add, update and delete an admin or a user.
- Admin can add, update and delete normal user.
- Search user with concept of debouncing.
- Filter users based on the date they were created.
- Login and Logout Functionality.

## Installation

Open your terminal and follow the commands:

```bash
git clone git@github.com:nishant-sendinblue/User-Management.git

cd frontend
npm install

cd server
npm install

```

To run project on local, open terminal and follow these steps:

```bash
cd frontend
npm start
cd server
nodemon or node index.js
```

### Local DB changes

- Create .env file on root of the server Folder.
- open .env file and add MONGO_URI= mongodb://localhost:27017/user_management

1. Create Database user_management.
2. Create collection users.
3. Insert this document into users collection:

   ```
   {
       "name": "your_name",
        "email": "your_mail@gmail.com",
        "password": "$2b$10$cw8/HmGcbdipZLLRhMpQoeL1FzwSxTPEABQ1vS3qnOqgdM1M3MK.q",
        "role": "admin",
        "status": "active", "createdAt": { "$date": "2022-03-15T08:48:14.745Z" },
        "updatedAt": { "$date": "2022-03-15T08:48:14.745Z" },
        "__v": 0
    }

   ```

4. Decrypted password is "nishant"
