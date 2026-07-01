import mongoose, { Schema, type Model } from "mongoose";

const CustomerTagSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    tags: [{ type: String }], // Array of tag IDs
  },
  { timestamps: true, collection: 'customer-tags-pancake' }
);

// Bypass Next.js hot-reload caching issue for Mongoose models
if (mongoose.models.CustomerTag) {
  delete mongoose.models.CustomerTag;
}
export const CustomerTag = mongoose.model("CustomerTag", CustomerTagSchema);
