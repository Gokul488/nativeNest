// Modified builderRoutes.js
const express = require("express");
const router = express.Router();

const {
  getBuilderDetails,
  updateBuilderDetails,
  getBuilderEvents,
  getBuilderProperties,
  deleteBuilderProperty
} = require("../controller/builderController");

router.get("/builder", getBuilderDetails);
router.put("/builder", updateBuilderDetails);
router.get("/builder/events", getBuilderEvents);
router.get("/builder/my-properties", getBuilderProperties);
router.delete("/builder/my-properties/:id", deleteBuilderProperty);

module.exports = router;