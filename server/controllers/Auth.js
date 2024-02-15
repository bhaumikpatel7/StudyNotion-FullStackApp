const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken")
require("dotenv").config();
//send OTP
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req.body
    const { email } = req.body;

    //check if user exists
    const checkUserPresent = await User.findOne({ email });

    //if user exists , then return response
    if (checkUserPresent) {
      return res.status(401).json({
        sucess: false,
        message: "User already registered",
      });
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated : ", otp);

    //check if otp unique or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    const otpPayload = { email, otp };

    //create an entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      sucess: true,
      message: "OTP sent Sucessfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

//signup
exports.signUp = async (req, res) => {
  try {
    //data fetch from req.body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //match both the password

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm password does not match",
      });
    }

    //check user exists or not
    const existingUser = User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find most recent otp for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //validate otp
    if (recentOtp.length == 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    } else if (otp !== recentOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp/otp not matching",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res
    return res.status(401).json({
      sucess: true,
      message: "User is registered Sucessfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
        sucess:false,
        message:"User cannot be registrered. please try again",
    })
  }
};

//login
exports.login = async (req,res) =>{
    try {
        //fetch email and password from req.body
        const {email,password} = req.body;
        //validate email and password
        if(!email || !password){
            return res.status(403).json({
                sucess:false,
                message:"All fields are required,please try again",
            });
        }
        //validate if user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                sucess:false,
                message:"user is not registered,please signup first",
            });
        }
        //check if password match
        if(await bcrypt.comoare(password,user.password)){
            const payload = {
                email : user.email,
                id:user._id,
                role:user.accountType,
                //generate JWT token
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

            const options = {
                expiresIn: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            //create cookie and send response
            res.cookie("token",token,options).status(200).json({
                sucess:true,
                token,
                user,
                message:"loggned in successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect"
            })
        }
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login failure please try again"
        })

    }
}

//change password