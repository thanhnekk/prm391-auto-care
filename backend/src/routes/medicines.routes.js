// backend/src/routes/medicines.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const MedicineController = require("../controllers/medicines.controller");

// === API CHO BÁC SĨ (VÀ ADMIN) ===
// Lấy danh sách thuốc để tìm kiếm/chọn
router.get("/", verifyJWT, MedicineController.getAllMedicines);

// === API CHỈ CHO ADMIN ===
// Thêm thuốc mới vào danh mục
router.post("/", verifyAdmin, MedicineController.createMedicine);

// Sửa thuốc trong danh mục
router.put("/:id", verifyAdmin, MedicineController.updateMedicine);

// Xóa thuốc khỏi danh mục
router.delete("/:id", verifyAdmin, MedicineController.deleteMedicine);

module.exports = router;