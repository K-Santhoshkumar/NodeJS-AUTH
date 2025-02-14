const Image = require("../models/img");
const {} = require("../helpers/cloudinary-helper");
const fs = require("fs");
const uploadTocloudinary = require("../helpers/cloudinary-helper");
const cloudinary = require("../config/cloudinary");
const uploadImageController = async (req, res) => {
  try {
    //check if the file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required.Please upload an image",
      });
    }
    //upload to cloudinary
    const { url, publicId } = await uploadTocloudinary(req.file.path);
    //store the image url and public id along with the uploaded user id in database
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });
    await newlyUploadedImage.save();
    //delete the file from local storage
    /* fs.unlinkSync(req.file.path); */
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newlyUploadedImage,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};
const fetchImageController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        message: "Successful",
        data: images,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};
//delete an image
const deleteImageController = async (req, res) => {
  try {
    const getCurrentIdofImageToBeDeleted = req.params.id;
    const userId = req.userInfo.userId;
    const image = await Image.findById(getCurrentIdofImageToBeDeleted);
    if (!image) {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    //check if this image is uploaded by the current user trying to delete
    if (image.uploadedBy.toString() !== userId) {
      res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this image because you have not uploaded it",
      });
    }
    //delete this image from the cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    //delete thus image from mongoDB database
    await Image.findByIdAndDelete(getCurrentIdofImageToBeDeleted);
    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};
module.exports = {
  uploadImageController,
  fetchImageController,
  deleteImageController,
};
