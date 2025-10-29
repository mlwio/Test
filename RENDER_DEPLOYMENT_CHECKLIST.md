# Quick Fix Checklist for Render.com Deployment

## The Issue
Your app works locally but fails on Render because **environment variables are missing**. Without `MONGODB_URI`, the app uses temporary in-memory storage that gets wiped on every restart.

## Quick Fix Steps

### 1️⃣ Add Environment Variables on Render (CRITICAL)

Go to your Render dashboard → Your Service → Environment tab and add:

**MONGODB_URI** (Required)
```
mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority
```
- Get this from MongoDB Atlas dashboard → Connect → Connect your application
- Replace `your-username` and `your-password` with actual credentials

**SESSION_SECRET** (Required)
```
your-random-secret-key-make-it-at-least-32-characters-long
```
- Use any long random string (32+ characters)
- Example: `my-super-secret-key-for-production-mlwio-2024`

**NODE_ENV** (Required)
```
production
```

**PORT** (Optional, defaults to 5000)
```
5000
```

### 2️⃣ Allow Render to Connect to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on "Network Access" in left sidebar
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

### 3️⃣ Verify Build Commands on Render

In your Render service settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### 4️⃣ Redeploy

After adding the environment variables, Render will automatically redeploy. Watch the logs for:
- ✅ `✓ Connected to MongoDB Atlas` ← This confirms database is working
- ✅ `Server running on http://0.0.0.0:5000` ← Server is ready

## Expected Behavior After Fix

✅ Login persists across page refreshes
✅ Dashboard loads content from MongoDB
✅ Uploads are saved and persist
✅ Data survives deployments and restarts

## Still Not Working?

### Check Render Logs
Look for these error messages:
- `MONGODB_URI not set` → Environment variable missing
- `Failed to connect to MongoDB` → Check MongoDB connection string
- `MongoServerError` → Check MongoDB Atlas network access

### Verify MongoDB Connection String
Your connection string should:
- Start with `mongodb+srv://`
- Include correct username and password (no `<` `>` brackets)
- Include your cluster address
- End with `?retryWrites=true&w=majority`

### Common Mistakes
❌ Forgot to replace `<username>` and `<password>` in connection string
❌ MongoDB Atlas not allowing connections from anywhere
❌ Wrong `SESSION_SECRET` (too short or missing)
❌ `NODE_ENV` set to `development` instead of `production`

## Example Environment Variables Setup

Here's what it should look like on Render:

| Key | Value |
|-----|-------|
| MONGODB_URI | `mongodb+srv://mlwio:MySecurePass123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority` |
| SESSION_SECRET | `mlwio-production-secret-key-2024-very-secure-random-string` |
| NODE_ENV | `production` |
| PORT | `5000` |

That's it! Your deployment should now work exactly like it does locally.
