// routes/appointment.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const AppointmentController = require("../controllers/appointment.controller");

router.post("/", verifyJWT, AppointmentController.createAppointment);
router.post("/:id/pay", verifyJWT, AppointmentController.payAppointment);
router.post("/:id/repay", verifyJWT, AppointmentController.repayAppointment);//thanh toan lai
router.post("/:id/cancel", verifyJWT, AppointmentController.cancelAppointment);
router.post("/:id/complete", verifyJWT, AppointmentController.completeAppointment);
router.get("/my", verifyJWT, AppointmentController.getAppointmentsByUser);
router.get("/slots/:doctorId", verifyJWT, AppointmentController.getDoctorSlots);
router.get("/public/:id", AppointmentController.getAppointmentById); // ai cũng xem được
router.get("/:id", verifyJWT, AppointmentController.getAppointmentByIdWithAuth); // chỉ owner
module.exports = router;
