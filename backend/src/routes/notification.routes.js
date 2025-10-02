// routes/notification.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const NotificationController = require("../controllers/notification.controller");

router.get("/", verifyJWT, NotificationController.getNotifications);
router.post("/:id/read", verifyJWT, NotificationController.markAsRead);

module.exports = router;
