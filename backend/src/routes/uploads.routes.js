const { Router } = require("express");
const multer = require("multer");

const uploadsController = require("../controllers/uploads.controller");

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/", upload.single("file"), uploadsController.uploadImage);

module.exports = router;
