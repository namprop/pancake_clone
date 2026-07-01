const { Router } = require("express");

const settingsController = require("../controllers/settings.controller");

const router = Router();

router.get("/tags", settingsController.listTags);
router.post("/tags", settingsController.createTag);
router.put("/tags/:id", settingsController.updateTag);
router.delete("/tags/:id", settingsController.deleteTag);

router.get("/roles", settingsController.listRoles);
router.post("/roles", settingsController.createRole);

router.get("/workspace", settingsController.listWorkspaces);
router.post("/workspace", settingsController.createWorkspace);
router.put("/workspace", settingsController.updateWorkspace);

router.get("/workspace_settings", settingsController.getWorkspaceSettings);
router.post("/workspace_settings", settingsController.updateWorkspaceSettings);

router.post("/general", settingsController.updateGeneralSettings);

router.get("/auto-replies", settingsController.listAutoReplies);
router.post("/auto-replies", settingsController.createAutoReply);

router.get("/activity-logs", settingsController.listActivityLogs);

router.get("/rotation-rules", settingsController.listRotationRules);
router.post("/rotation-rules", settingsController.createRotationRule);

module.exports = router;
