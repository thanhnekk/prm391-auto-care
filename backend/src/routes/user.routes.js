// routes/user.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const UserController = require("../controllers/user.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");

router.post("/", UserController.createUser);
router.get("/", verifyJWT, UserController.getAllUsers);
router.get("/by-email", verifyJWT, UserController.getUserByEmail);
router.put("/", verifyJWT, UserController.updateUser);
router.delete("/", verifyJWT, UserController.deleteUser);

// (GET /api/users/admin) - Lấy danh sách user (có phân trang/lọc)
router.get("/admin", verifyAdmin, UserController.adminGetAllUsers);

// (GET /api/users/admin/:id) - Lấy chi tiết 1 user bất kỳ
router.get("/admin/:id", verifyAdmin, UserController.adminGetUserById);

// (PUT /api/users/admin/:id) - Cập nhật 1 user (phân quyền, khóa...)
router.put("/admin/:id", verifyAdmin, UserController.adminUpdateUser);

// (DELETE /api/users/admin/:id) - Xóa mềm 1 user
router.delete("/admin/:id", verifyAdmin, UserController.adminDeleteUser);
module.exports = router;
