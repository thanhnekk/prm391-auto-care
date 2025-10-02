// routes/prescription.routes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const PrescriptionController = require("../controllers/prescription.controller");

router.post("/", verifyJWT, PrescriptionController.createPrescription);
router.post("/:id/medicine", verifyJWT, PrescriptionController.addMedicine);

module.exports = router;
