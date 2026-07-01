const mongoose = require("mongoose");

const { Schema } = mongoose;

const ImageFolderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true, collection: "image-folders-pancake" }
);

module.exports =
  mongoose.models.ImageFolder || mongoose.model("ImageFolder", ImageFolderSchema);
