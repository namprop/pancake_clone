const { Router } = require("express");

const webhookController = require("../controllers/webhook.controller");

const router = Router();

router.get("/facebook", webhookController.verifyFacebookWebhook);
router.post("/facebook", webhookController.receiveFacebookWebhook);

module.exports = router;
