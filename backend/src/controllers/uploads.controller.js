const fs = require("fs/promises");
const path = require("path");

async function uploadImage(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "Không tìm thấy file tải lên" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ success: false, error: "Chỉ hỗ trợ tải ảnh" });
    }

    const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(file.originalname) || ".png";
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);
    const filename = `${Date.now()}-${safeBaseName}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, file.buffer);

    return res.json({
      success: true,
      data: {
        name: file.originalname,
        url: `/uploads/${filename}`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  uploadImage,
};
