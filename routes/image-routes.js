const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const router = express.Router();
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImageController,
  fetchImageController,
  deleteImageController,
} = require("../controllers/image-controller");
//upload the image
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImageController
);

//get all the image
router.get("/get", authMiddleware, fetchImageController);
//delete an image
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);
module.exports = router;
