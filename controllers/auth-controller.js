const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userInfo = require("../middleware/auth-middleware");
//register controller
const registerUser = async (req, res) => {
  try {
    //extract user information from our request body
    const { username, email, password, role } = req.body;
    //check if the user is already exists
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User is already exists with same username or same email.Please try with a different email or username",
      });
    }
    //hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    //create a new user and save in ur database
    const newlyCreatedUser = new User({
      username,
      email,
      password: hashedpassword,
      role: role || "user",
    });
    await newlyCreatedUser.save();
    if (newlyCreatedUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user.Please try again",
      });
    }
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//login controller
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    //find if the current user is exists in database or not
    const checkExistingUser = await User.findOne({ username });
    if (!checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid username ",
      });
    }
    //if the password is correct or not
    const isPasswordMatch = await bcrypt.compare(
      password,
      checkExistingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    //create user token
    const accessToken = jwt.sign(
      {
        userId: checkExistingUser._id,
        username: checkExistingUser.username,
        role: checkExistingUser.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );
    res.status(200).json({
      success: true,
      message: "Logged in Successful",
      accessToken,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = user.userId;
    //extract old and new password
    const { oldPassword, newPassword } = req.body;
    //find the current logged user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    //check if old password is correct
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct! Please try again",
      });
    }
    //hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    //update the user password
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password has changed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
module.exports = { registerUser, loginUser, changePassword };
