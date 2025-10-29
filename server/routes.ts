import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MongoStore from "connect-mongo";
import { insertContentItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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

  const httpServer = createServer(app);

  return httpServer;
}
