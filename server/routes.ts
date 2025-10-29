import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MongoStore from "connect-mongo";
import { insertContentItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import https from "https";
import http from "http";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ Allow cookies over HTTPS (Render fix)
  app.set("trust proxy", 1);

  // Session store configuration
  const sessionStore = process.env.MONGODB_URI
    ? MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        dbName: "mlwio",
        collectionName: "sessions",
        ttl: 60 * 60 * 24 * 7, // 7 days
        autoRemove: "native",
      })
    : undefined;

  console.log(`✅ Session store: ${sessionStore ? 'MongoDB' : 'Memory (MemoryStore)'}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);

  // Session middleware
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET || "mlwio-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      console.log(`❌ Unauthorized access attempt`);
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password required" });
      }

      const user = await storage.verifyPassword(username, password);

      if (!user) {
        return res.status(401).json({ error: "Wrong password" });
      }

      req.session.userId = user.id;

      console.log(`✅ Login successful - User: ${user.username}`);

      // ✅ Explicitly save session
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        console.log(`✅ Session saved for user: ${user.username}`);
        return res.json({ user: { id: user.id, username: user.username } });
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user: { id: user.id, username: user.username } });
  });

  // Get all content (public endpoint)
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getAllContent();
      return res.json(content);
    } catch (error) {
      console.error("Get content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Search content (public endpoint) - MUST be before :id route
  app.get("/api/content/search", async (req, res) => {
    try {
      const { q, category } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query required" });
      }

      const content = await storage.searchContent(
        q,
        category && typeof category === "string" ? category : undefined
      );

      return res.json(content);
    } catch (error) {
      console.error("Search content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get content by ID (public endpoint)
  app.get("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContentById(id);

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      return res.json(content);
    } catch (error: any) {
      // Handle invalid MongoDB ObjectId format
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        return res.status(404).json({ error: "Content not found" });
      }
      console.error("Get content by ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create content
  app.post("/api/content", requireAuth, async (req, res) => {
    try {
      const result = insertContentItemSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const content = await storage.createContent(result.data);
      
      await storage.createUploadLog({ contentTitle: content.title });
      
      return res.json(content);
    } catch (error) {
      console.error("Create content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update content
  app.put("/api/content/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertContentItemSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const content = await storage.updateContent(id, result.data);

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      return res.json(content);
    } catch (error) {
      console.error("Update content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete content
  app.delete("/api/content/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password required" });
      }

      const user = await storage.verifyPassword(username, password);

      if (!user) {
        return res.status(401).json({ error: "Wrong password" });
      }

      const deleted = await storage.deleteContent(id);

      if (!deleted) {
        return res.status(404).json({ error: "Content not found" });
      }

      return res.json({ success: true, message: "Content deleted successfully" });
    } catch (error) {
      console.error("Delete content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Download endpoint - proxies file download to bypass intermediate pages
  app.get("/api/download", async (req, res) => {
    try {
      const { url, title } = req.query;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Download URL required" });
      }

      const filename = title && typeof title === "string" 
        ? `${title.replace(/[^a-z0-9\s]/gi, '_').replace(/\s+/g, '_')}.mp4` 
        : "video.mp4";

      console.log(`✅ Download requested: ${filename}`);

      // For Google Drive links, convert to direct download format
      let downloadUrl = url;
      if (url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}&confirm=t`;
        }
      }

      console.log(`✅ Proxying download from: ${downloadUrl}`);

      // Set headers for immediate download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');

      // Determine protocol
      const protocol = downloadUrl.startsWith('https') ? https : http;

      // Proxy the download through our server
      const proxyRequest = protocol.get(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (proxyResponse) => {
        // Check if we got an HTML page (virus warning)
        const contentType = proxyResponse.headers['content-type'] || '';
        
        if (contentType.includes('text/html') && proxyResponse.statusCode === 200) {
          // This is likely a virus scan warning page, extract the real download link
          let htmlData = '';
          proxyResponse.on('data', (chunk) => {
            htmlData += chunk.toString();
          });
          
          proxyResponse.on('end', () => {
            // Extract the download link from the confirmation page
            const downloadFormMatch = htmlData.match(/action="([^"]+)"/);
            const confirmMatch = htmlData.match(/name="confirm"\s+value="([^"]+)"/);
            const idMatch = htmlData.match(/name="id"\s+value="([^"]+)"/);
            const uuidMatch = htmlData.match(/name="uuid"\s+value="([^"]+)"/);
            
            if (downloadFormMatch || (confirmMatch && idMatch)) {
              let realDownloadUrl;
              if (downloadFormMatch) {
                realDownloadUrl = 'https://drive.google.com' + downloadFormMatch[1].replace(/&amp;/g, '&');
              } else {
                const confirm = confirmMatch![1];
                const id = idMatch![1];
                const uuid = uuidMatch ? uuidMatch[1] : '';
                realDownloadUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=${confirm}&uuid=${uuid}`;
              }
              
              console.log(`✅ Extracted real download URL, re-proxying...`);
              
              // Make second request to the real download URL
              https.get(realDownloadUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              }, (finalResponse) => {
                if (finalResponse.statusCode === 302 || finalResponse.statusCode === 301) {
                  // Follow redirect
                  const redirectUrl = finalResponse.headers.location;
                  if (redirectUrl) {
                    https.get(redirectUrl, (redirectedResponse) => {
                      redirectedResponse.pipe(res);
                    }).on('error', (err) => {
                      console.error("Redirect error:", err);
                      res.status(500).json({ error: "Failed to follow redirect" });
                    });
                  }
                } else {
                  finalResponse.pipe(res);
                }
              }).on('error', (err) => {
                console.error("Final download error:", err);
                res.status(500).json({ error: "Download failed" });
              });
            } else {
              // Could not extract download link, redirect user
              console.log(`⚠️ Could not extract download link, falling back to redirect`);
              res.redirect(downloadUrl);
            }
          });
        } else if (proxyResponse.statusCode === 302 || proxyResponse.statusCode === 301) {
          // Follow redirects
          const redirectUrl = proxyResponse.headers.location;
          if (redirectUrl) {
            console.log(`✅ Following redirect to: ${redirectUrl}`);
            const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
            redirectProtocol.get(redirectUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }, (redirectedResponse) => {
              redirectedResponse.pipe(res);
            }).on('error', (err) => {
              console.error("Redirect error:", err);
              res.status(500).json({ error: "Failed to follow redirect" });
            });
          } else {
            res.status(500).json({ error: "Redirect location missing" });
          }
        } else {
          // Stream the file directly to the client
          proxyResponse.pipe(res);
        }
      });

      proxyRequest.on('error', (err) => {
        console.error("Proxy request error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Download failed" });
        }
      });

      // Handle client disconnect
      req.on('close', () => {
        proxyRequest.destroy();
      });
    } catch (error) {
      console.error("Download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Download failed" });
      }
    }
  });

  // Health check endpoint - verifies app responds to requests
  app.get("/api/health", (req, res) => {
    return res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "MLWIO API",
      endpoints: {
        auth: "/api/auth/login",
        content: "/api/content",
        download: "/api/download"
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
