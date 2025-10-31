// routes/doctor.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const DoctorController = require("../controllers/doctor.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin"); 
router.get("/", verifyJWT, DoctorController.getAllDoctors);
router.get("/:id", verifyJWT, DoctorController.getDoctorById);
router.post("/:id/service", verifyJWT, DoctorController.addService);
router.get("/by-service/:serviceId", verifyJWT, DoctorController.getDoctorsByService);
// (GET /api/doctors/admin) - Lấy danh sách bác sĩ (có phân trang/lọc)
router.get("/admin", verifyAdmin, DoctorController.adminGetAllDoctors);

// (PUT /api/doctors/admin/:id) - Cập nhật hồ sơ bác sĩ (chuyên môn, dịch vụ...)
// :id ở đây là ID của hồ sơ 'Doctor'
router.put("/admin/:id", verifyAdmin, DoctorController.adminUpdateDoctor);

// (DELETE /api/doctors/admin/:id) - Xóa hồ sơ bác sĩ (và hạ quyền user)
router.delete("/admin/:id", verifyAdmin, DoctorController.adminDeleteDoctor);
module.exports = router;
