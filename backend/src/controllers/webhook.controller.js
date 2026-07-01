const { connectDB } = require("../config/db");

function verifyFacebookWebhook(req, res) {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const verifyToken =
      process.env.WEBHOOK_VERIFY_TOKEN || "dev-webhook-verify-token";

    if (mode === "subscribe" && token === verifyToken) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Forbidden");
  } catch (error) {
    console.error("Facebook Webhook GET error:", error);
    return res.status(500).send("Internal Server Error");
  }
}

async function receiveFacebookWebhook(req, res) {
  try {
    await connectDB();
    console.log(
      "Facebook Webhook Payload Received:",
      JSON.stringify(req.body, null, 2)
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("Facebook Webhook POST error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  verifyFacebookWebhook,
  receiveFacebookWebhook,
};
