const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "pancake-clone-backend",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
