const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const customersRoutes = require("./routes/customers.routes");
const facebookRoutes = require("./routes/facebook.routes");
const healthRoutes = require("./routes/health.routes");
const {
  imageFoldersRouter,
  quickRepliesRouter,
  quickReplyTopicsRouter,
} = require("./routes/quickReplies.routes");
const settingsRoutes = require("./routes/settings.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3012";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/facebook", facebookRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/quick_replies", quickRepliesRouter);
app.use("/api/quick_reply_topics", quickReplyTopicsRouter);
app.use("/api/image_folders", imageFoldersRouter);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/health", healthRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("[backend:error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

module.exports = app;
