const mongoose = require("mongoose");

const { Schema } = mongoose;

const CustomerTagSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    tags: [{ type: String }],
  },
  { timestamps: true, collection: "customer-tags-pancake" }
);

module.exports =
  mongoose.models.CustomerTag || mongoose.model("CustomerTag", CustomerTagSchema);
