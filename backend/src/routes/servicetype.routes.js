const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const ServiceTypeController = require("../controllers/servicetype.controller");

router.post("/", verifyJWT, ServiceTypeController.createServiceType);
router.get("/", verifyJWT, ServiceTypeController.getAllServiceTypes);
router.get("/:id", verifyJWT, ServiceTypeController.getServiceTypeById);
router.put("/:id", verifyJWT, ServiceTypeController.updateServiceType);
router.delete("/:id", verifyJWT, ServiceTypeController.deleteServiceType);

module.exports = router;
