
const jwt = require("jasonwebtoken");
require("dotenv").config();
const User = require("../models/User");



//auth

exports.auth = async (req,res,next) => {
    try {
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ","");

        //if token missing , then return res
        if(!token){
            return res.status(401).json({
                success:false,
                message:"token is missing",
            });
        }
        //verify token
        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);

            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"token is invalid",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"something went wrong while validating the token",
        });
    }
}


//isStudent

exports.isStudent = async (req,res,next) => {

    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only",
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User role can not be varified",
        });
    }
  
}

//isAdmin
exports.isAdmin = async (req,res,next) => {

    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only",
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User role can not be varified",
        });
    }
  
}

//isInstructor

exports.isInstructor = async (req,res,next) => {

    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor only",
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User role can not be varified",
        });
    }
  
}