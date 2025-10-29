import { connectDB } from "./db";
import { UserModel, ContentItemModel, UploadLogModel, type User, type InsertUser, type ContentItem, type InsertContentItem, type UploadLog, type InsertUploadLog } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  
  // Content methods
  createContent(content: InsertContentItem): Promise<ContentItem>;
  getAllContent(): Promise<ContentItem[]>;
  getContentByCategory(category: string): Promise<ContentItem[]>;
  searchContent(query: string, category?: string): Promise<ContentItem[]>;
  updateContent(id: string, content: InsertContentItem): Promise<ContentItem | undefined>;
  deleteContent(id: string): Promise<boolean>;
  getContentById(id: string): Promise<ContentItem | undefined>;
  
  // Upload log methods
  createUploadLog(log: InsertUploadLog): Promise<UploadLog>;
  getUploadLogs(): Promise<UploadLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private content: Map<string, ContentItem> = new Map();
  private uploadLogs: Map<string, UploadLog> = new Map();
  private nextUserId = 1;
  private nextContentId = 1;
  private nextLogId = 1;

  constructor() {
    const mlwioPassword = bcrypt.hashSync("MLWIO0372", 10);
    const mlwioUser: User = {
      id: "1",
      _id: "1",
      username: "mlwio",
      password: mlwioPassword,
    };
    this.users.set("1", mlwioUser);
    
    this.nextUserId = 2;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = String(this.nextUserId++);
    const user: User = {
      id,
      _id: id,
      username: insertUser.username,
      password: hashedPassword,
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createContent(content: InsertContentItem): Promise<ContentItem> {
    const id = String(this.nextContentId++);
    const item: ContentItem = {
      _id: id,
      title: content.title,
      category: content.category,
      thumbnail: content.thumbnail,
      releaseYear: content.releaseYear,
      driveLink: content.driveLink,
      seasons: content.seasons,
      createdAt: new Date(),
    };
    this.content.set(id, item);
    return item;
  }

  async getAllContent(): Promise<ContentItem[]> {
    return Array.from(this.content.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getContentByCategory(category: string): Promise<ContentItem[]> {
    return Array.from(this.content.values())
      .filter(item => item.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async searchContent(query: string, category?: string): Promise<ContentItem[]> {
    return Array.from(this.content.values())
      .filter(item => {
        const lowerQuery = query.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
        const matchesYear = item.releaseYear ? item.releaseYear.toString().includes(query) : false;
        const matchesQuery = matchesTitle || matchesYear;
        const matchesCategory = !category || item.category === category;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getContentById(id: string): Promise<ContentItem | undefined> {
    return this.content.get(id);
  }

  async updateContent(id: string, content: InsertContentItem): Promise<ContentItem | undefined> {
    const existing = this.content.get(id);
    if (!existing) return undefined;
    
    const updated: ContentItem = {
      _id: id,
      title: content.title,
      category: content.category,
      thumbnail: content.thumbnail,
      releaseYear: content.releaseYear,
      driveLink: content.driveLink,
      seasons: content.seasons,
      createdAt: existing.createdAt,
    };
    this.content.set(id, updated);
    return updated;
  }

  async deleteContent(id: string): Promise<boolean> {
    return this.content.delete(id);
  }

  async createUploadLog(log: InsertUploadLog): Promise<UploadLog> {
    const id = String(this.nextLogId++);
    const uploadLog: UploadLog = {
      _id: id,
      contentTitle: log.contentTitle,
      uploadedAt: new Date(),
    };
    this.uploadLogs.set(id, uploadLog);
    return uploadLog;
  }

  async getUploadLogs(): Promise<UploadLog[]> {
    return Array.from(this.uploadLogs.values()).sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
}

export class DbStorage implements IStorage {
  constructor() {
    // Ensure database connection is established
    connectDB().catch(console.error);
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean() as any;
    if (!user) return undefined;
    return {
  id: user._id.toString(),
  _id: user._id.toString(),
  username: user.username,
  password: user.password,
};

  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean() as any;
    if (!user) return undefined;
    return {
  id: user._id.toString(),
  _id: user._id.toString(),
  username: user.username,
  password: user.password,
};

  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user = await UserModel.create({
      username: insertUser.username,
      password: hashedPassword,
    });
    return {
  id: user._id.toString(),
  _id: user._id.toString(),
  username: user.username,
  password: user.password,
};

  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createContent(content: InsertContentItem): Promise<ContentItem> {
    const item = await ContentItemModel.create(content) as any;
    return {
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    };
  }

  async getAllContent(): Promise<ContentItem[]> {
    const items = await ContentItemModel.find().sort({ createdAt: -1 }).lean() as any[];
    return items.map(item => ({
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    }));
  }

  async getContentByCategory(category: string): Promise<ContentItem[]> {
    const items = await ContentItemModel.find({ category }).sort({ createdAt: -1 }).lean() as any[];
    return items.map(item => ({
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    }));
  }

  async searchContent(query: string, category?: string): Promise<ContentItem[]> {
    const orConditions: any[] = [
      { title: { $regex: query, $options: 'i' } }
    ];
    
    // If query is a number, also search by release year
    if (!isNaN(parseInt(query))) {
      orConditions.push({ releaseYear: parseInt(query) });
    }
    
    const filter: any = { $or: orConditions };
    
    if (category) {
      filter.category = category;
    }
    
    const items = await ContentItemModel.find(filter).sort({ createdAt: -1 }).lean() as any[];
    return items.map(item => ({
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    }));
  }

  async getContentById(id: string): Promise<ContentItem | undefined> {
    const item = await ContentItemModel.findById(id).lean() as any;
    if (!item) return undefined;
    return {
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    };
  }

  async updateContent(id: string, content: InsertContentItem): Promise<ContentItem | undefined> {
    const item = await ContentItemModel.findByIdAndUpdate(id, content, { new: true }).lean() as any;
    if (!item) return undefined;
    return {
      _id: item._id.toString(),
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnail,
      releaseYear: item.releaseYear,
      driveLink: item.driveLink,
      seasons: item.seasons,
      createdAt: item.createdAt,
    };
  }

  async deleteContent(id: string): Promise<boolean> {
    const result = await ContentItemModel.findByIdAndDelete(id);
    return result !== null;
  }

  async createUploadLog(log: InsertUploadLog): Promise<UploadLog> {
    const item = await UploadLogModel.create({
      contentTitle: log.contentTitle,
      uploadedAt: new Date(),
    }) as any;
    return {
      _id: item._id.toString(),
      contentTitle: item.contentTitle,
      uploadedAt: item.uploadedAt,
    };
  }

  async getUploadLogs(): Promise<UploadLog[]> {
    const logs = await UploadLogModel.find().sort({ uploadedAt: -1 }).lean() as any[];
    return logs.map(log => ({
      _id: log._id.toString(),
      contentTitle: log.contentTitle,
      uploadedAt: log.uploadedAt,
    }));
  }
}

// Use DbStorage if MONGODB_URI is set, otherwise use MemStorage
export const storage = process.env.MONGODB_URI ? new DbStorage() : new MemStorage();
