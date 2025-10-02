// routes/doctor.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const DoctorController = require("../controllers/doctor.controller");

router.get("/", verifyJWT, DoctorController.getAllDoctors);
router.get("/:id", verifyJWT, DoctorController.getDoctorById);
router.post("/:id/service", verifyJWT, DoctorController.addService);
router.get("/by-service/:serviceId", verifyJWT, DoctorController.getDoctorsByService);

module.exports = router;
