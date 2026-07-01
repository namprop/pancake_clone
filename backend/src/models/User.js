const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "users-pancake" }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
