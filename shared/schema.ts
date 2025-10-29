import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: any;
  _id: string;
  username: string;
  password: string;
};

export type Season = {
  seasonNumber: number;
  episodes: Episode[];
};

export type Episode = {
  episodeNumber: number;
  link: string;
};

export interface IContentItem extends Document {
  _id: string;
  title: string;
  releaseYear: number;
  category: string;
  thumbnail: string;
  driveLink?: string;
  seasons?: Season[];
  createdAt: Date;
}

const seasonSchema = new Schema({
  seasonNumber: { type: Number, required: true },
  episodes: [{
    episodeNumber: { type: Number, required: true },
    link: { type: String, required: true },
  }],
}, { _id: false });

const contentItemSchema = new Schema<IContentItem>({
  title: { type: String, required: true },
  releaseYear: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true },
  driveLink: { type: String },
  seasons: [seasonSchema],
  createdAt: { type: Date, required: true, default: Date.now },
});

export const ContentItemModel = mongoose.models.ContentItem || mongoose.model<IContentItem>("ContentItem", contentItemSchema);

export const insertContentItemSchema = z.object({
  title: z.string().min(1),
  releaseYear: z.number().min(1900).max(2100),
  category: z.string().min(1),
  thumbnail: z.string().url(),
  driveLink: z.string().url().optional(),
  seasons: z.array(z.object({
    seasonNumber: z.number(),
    episodes: z.array(z.object({
      episodeNumber: z.number(),
      link: z.string().url(),
    })),
  })).optional(),
});

export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = {
  _id: string;
  title: string;
  releaseYear: number;
  category: string;
  thumbnail: string;
  driveLink?: string;
  seasons?: Season[];
  createdAt: Date;
};

export interface IUploadLog extends Document {
  _id: string;
  contentTitle: string;
  uploadedAt: Date;
}

const uploadLogSchema = new Schema<IUploadLog>({
  contentTitle: { type: String, required: true },
  uploadedAt: { type: Date, required: true, default: Date.now },
});

export const UploadLogModel = mongoose.models.UploadLog || mongoose.model<IUploadLog>("UploadLog", uploadLogSchema);

export const insertUploadLogSchema = z.object({
  contentTitle: z.string().min(1),
});

export type InsertUploadLog = z.infer<typeof insertUploadLogSchema>;
export type UploadLog = {
  _id: string;
  contentTitle: string;
  uploadedAt: Date;
};
