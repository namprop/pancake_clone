export type UserRole = "admin" | "manager" | "staff";
export type ObjectIdLike = string;

export interface IUser {
  _id: ObjectIdLike;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  workspaceId?: ObjectIdLike;
  roleId?: ObjectIdLike;
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
