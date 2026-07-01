import type { Types } from "mongoose";

export type UserRole = "admin" | "manager" | "staff";

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  workspaceId?: Types.ObjectId;
  roleId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
