const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const ServiceTypeController = require("../controllers/servicetype.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
// === API CHO ADMIN (Web Quản trị) ===
// Chỉ Admin mới được Tạo, Sửa, Xóa
router.post("/", verifyAdmin, ServiceTypeController.createServiceType);
router.put("/:id", verifyAdmin, ServiceTypeController.updateServiceType);
router.delete("/:id", verifyAdmin, ServiceTypeController.deleteServiceType);

// === API CHO NGƯỜI DÙNG (App Mobile) ===
// Tất cả người dùng đã đăng nhập đều có thể xem (để app load danh sách)
router.get("/", verifyJWT, ServiceTypeController.getAllServiceTypes);
router.get("/:id", verifyJWT, ServiceTypeController.getServiceTypeById);

module.exports = router;
