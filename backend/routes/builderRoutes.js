// Modified builderRoutes.js
const express = require("express");
const router = express.Router();

const {
  getBuilderDetails,
  updateBuilderDetails,
  getBuilderEvents,
  getBuilderProperties,
  deleteBuilderProperty,
  getBuilderStallInterests,
  getBuilderBookedStallsCount,
  getBuilderDashboardStats,
  createBuilder,
  getAllBuilders,
  deleteBuilderByAdmin,
  updateBuilderByAdmin
} = require("../controller/builderController");

router.get("/builder", getBuilderDetails);
router.put("/builder", updateBuilderDetails);
router.get("/builder/events", getBuilderEvents);
router.get("/builder/my-properties", getBuilderProperties);
router.delete("/builder/my-properties/:id", deleteBuilderProperty);
router.get("/builder/stall-interests", getBuilderStallInterests);
router.get("/builder/booked-stalls-count", getBuilderBookedStallsCount);
router.get("/builder/dashboard-stats", getBuilderDashboardStats);
router.post("/builder/create", createBuilder);
router.get("/builder/all", getAllBuilders);
router.delete("/builder/:builderId", deleteBuilderByAdmin);
router.put("/builder/:builderId", updateBuilderByAdmin);

module.exports = router;