const { Router } = require("express");
const multer = require("multer");

const facebookController = require("../controllers/facebook.controller");

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/callback", facebookController.callback);
router.get("/pages", facebookController.listPages);
router.post("/pages/connect", facebookController.connectPage);
router.post("/webhook-subscriptions", facebookController.subscribeWebhooks);
router.post("/sync", facebookController.syncFacebook);
router.post("/send-message", upload.any(), facebookController.sendMessage);

module.exports = router;
