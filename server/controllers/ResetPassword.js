const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resent password token

exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req.body
    const email = req.body.email;
    //check user for this email, email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "your email is not registered with us",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing the url
    await mailSender(
      email,
      "Password reset link",
      `password reset link: ${url}`
    );
    //return response
    return res.json({
      success: false,
      message: "email sent successfully,please change email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while resetting your password",
    });
  }
};
//reset password

exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;

    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching",
      });
    }
    //get user details from db using token
    const userDetails = await User.findOne({ token: token });

    //if no entry -- then invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "token invalid",
      });
    }

    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "token is expired.",
      });
    }
    //password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //update the password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "password reset successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while resetting your password",
    });
  }
};
