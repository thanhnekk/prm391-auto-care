// backend/src/routes/prescription.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const PrescriptionController = require("../controllers/prescription.controller");

// === API CHO DOCTOR ===
// Tạo đơn thuốc mới (bao gồm cả thuốc)
router.post("/", verifyJWT, PrescriptionController.createPrescription);

// Cập nhật đơn thuốc (sửa ghi chú, thêm/xóa thuốc)
// :id là ID của Đơn thuốc
router.put("/:id", verifyJWT, PrescriptionController.updatePrescription);

// === API CHO APP (USER/DOCTOR) ===
// Lấy đơn thuốc theo ID Lịch hẹn
router.get(
    "/by-appointment/:appointmentId",
    verifyJWT,
    PrescriptionController.getPrescriptionByAppointment
);

// === API CHO ADMIN ===
router.get("/admin", verifyAdmin, PrescriptionController.adminGetAllPrescriptions);
router.get("/admin/:id", verifyAdmin, PrescriptionController.adminGetPrescriptionById);
router.delete("/admin/:id", verifyAdmin, PrescriptionController.adminDeletePrescription);

module.exports = router;