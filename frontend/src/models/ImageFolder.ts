import mongoose, { Schema } from "mongoose";

const ImageFolderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true, collection: "image-folders-pancake" }
);

if (mongoose.models.ImageFolder) {
  delete mongoose.models.ImageFolder;
}

export const ImageFolder = mongoose.model(
  "ImageFolder",
  ImageFolderSchema
);
