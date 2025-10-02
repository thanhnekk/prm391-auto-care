// routes/user.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const UserController = require("../controllers/user.controller");

router.post("/", UserController.createUser);
router.get("/", verifyJWT, UserController.getAllUsers);
router.get("/by-email", verifyJWT, UserController.getUserByEmail);
router.put("/", verifyJWT, UserController.updateUser);
router.delete("/", verifyJWT, UserController.deleteUser);

module.exports = router;
