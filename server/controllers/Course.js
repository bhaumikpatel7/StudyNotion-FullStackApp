const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");

const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse  handler function
exports.createCourse = async (req,res) =>{
    try {
        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag} = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag ){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        //check for instructor level validation
        const userId = req.user.id;
        const instructorDetails = await User.findById({userId});

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:'Instrructor details not found',
            })
        }
        // check if given tag is valid or not
        const tagDetails = await Tag.findById(Tag);
        if(!tagDetails){
            return res.status(400).json({
                success:false,
                message:'Tag details not found',
            })
        }
        //upload image
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseDescription,
            courseName,
            instructor:instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,

        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },{new:true},);

        // update the TAG schema



        return res.status(400).json({
            success:true,
            message:'Course created successfully',
            data:newCourse,
        })


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'failed to create a course',
        })
    }
}




//getAllCourse

exports.showAllCourses = async (req,res)=>{
    try {
        const allCourses = await Course.find({},{courseName:true,price:true,thumbnail:true,ratingAndReviews:true,studentsEnrolled:true}).populate("instructor").exec();
        
        return res.status(400).json({
            success:true,
            message:'data for all courses fetched successfully',
            data:allCourses,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'unable to get all the courses',
        })
    }
}