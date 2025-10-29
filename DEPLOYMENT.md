# Deployment Guide for Render.com

## Prerequisites
- A MongoDB Atlas account with a cluster set up
- A Render.com account

## Step 1: Get Your MongoDB Connection String

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on "Connect" for your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual database password
6. Replace `<username>` with your database username

## Step 2: Configure Environment Variables on Render

1. Go to your Render.com dashboard
2. Select your web service
3. Go to the "Environment" tab
4. Add the following environment variables:

### Required Environment Variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```
**IMPORTANT**: Replace `<username>` and `<password>` with your actual MongoDB credentials

```
SESSION_SECRET=your-random-secret-key-here-make-it-long-and-secure
```
**IMPORTANT**: Generate a strong random string (at least 32 characters)

```
NODE_ENV=production
```

```
PORT=5000
```

## Step 3: Configure Build Settings on Render

Make sure your Render service has these settings:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Auto-Deploy**: Yes (optional, deploys on git push)

## Step 4: Verify Deployment

After adding the environment variables:

1. Render will automatically redeploy your application
2. Check the deployment logs for:
   - `✓ Connected to MongoDB Atlas` (confirms database connection)
   - `✅ Server running on http://0.0.0.0:5000` (confirms server started)

3. Test your application:
   - Login should work
   - Dashboard should load data from MongoDB
   - Uploads should persist after page refresh

## Troubleshooting

### Issue: "MONGODB_URI not set. Using in-memory storage."
**Solution**: Make sure you added `MONGODB_URI` in Render's environment variables and redeployed.

### Issue: Login works but data doesn't persist
**Solution**: Verify the MongoDB connection string is correct and your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) in Network Access settings.

### Issue: Session/Authentication errors
**Solution**: 
- Make sure `SESSION_SECRET` is set
- Verify your MongoDB cluster is accessible
- Check that `NODE_ENV=production` is set

### Issue: Can't connect to MongoDB from Render
**Solution**: 
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Save changes

## Security Notes

- Never commit `.env` file to git (it's in `.gitignore`)
- Use strong, unique values for `SESSION_SECRET` in production
- Regularly rotate your MongoDB credentials
- Keep your MongoDB Atlas network access restricted to known IPs when possible

## Need Help?

- Check Render logs for error messages
- Verify MongoDB Atlas connection string is correct
- Ensure all environment variables are set exactly as shown above
