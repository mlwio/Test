# MLWIO API

A full-stack application for managing content with authentication, built with Express, React, and MongoDB Atlas.

## Features

- User authentication with session management
- Content management (create, read, update, delete)
- MongoDB Atlas database support
- Persistent session storage using MongoDB
- Secure password hashing with bcrypt

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Session Secret (change in production)
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000
```

### 3. Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on "Connect" for your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database credentials
6. Paste it into your `.env` file as `MONGODB_URI`

### 4. Important: Whitelist Your IP Address

**This is crucial to avoid connection errors!**

1. In MongoDB Atlas, go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Either:
   - Click "Add Current IP Address" to whitelist your current IP
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The application will run on `http://localhost:5000`

## Default Credentials

- Username: `********`
- Password: `**********`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Content Management (requires authentication)
- `GET /api/content` - Get all content
- `GET /api/content/search?q=<query>&category=<category>` - Search content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content by ID
- `DELETE /api/content/:id` - Delete content by ID (requires password confirmation)

## Troubleshooting

### "401 Unauthorized" Error After Login

This has been fixed! The issue was that sessions weren't being stored persistently. The application now:

1. ✅ Uses MongoDB to store sessions (not in-memory)
2. ✅ Explicitly saves sessions before sending login response
3. ✅ Automatically switches to MongoDB storage when `MONGODB_URI` is set

**Make sure:**
- Your `.env` file has the correct `MONGODB_URI`
- Your MongoDB Atlas IP whitelist includes your IP address
- You restart the server after changing `.env` variables

### "Failed to connect to MongoDB" Error

**Solutions:**
1. Check that your MongoDB Atlas cluster is running
2. Verify your IP address is whitelisted in MongoDB Atlas → Network Access
3. Confirm your connection string credentials are correct
4. Make sure the connection string is in the correct format

### Sessions Not Persisting

The application now uses MongoDB to store sessions. If you still have issues:

1. Check MongoDB Atlas connection is successful (check server logs)
2. Verify the `sessions` collection is created in your `mlwio` database
3. Clear your browser cookies and try again

## Project Structure

```
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities and query client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes and session config
│   ├── storage.ts       # Database abstraction layer
│   └── db.ts            # MongoDB connection
├── shared/              # Shared types and schemas
│   └── schema.ts        # Data models and validation
└── .env                 # Environment variables (create this)
```

## Technologies Used

- **Frontend:** React, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend:** Express, MongoDB, Mongoose
- **Authentication:** express-session with MongoDB session store
- **Validation:** Zod
- **Password Hashing:** bcrypt

## License

MIT
# MLWIO_Admin1
