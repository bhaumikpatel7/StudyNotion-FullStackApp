const Section = require("../models/Section");
const Course = require("../models/Course");

//create section handler

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;

    //validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "missing properties",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //update the course model with section objID
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { courseId },
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );

    //return res

    return res.status(200).json({
      success: true,
      message: "section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "unable to create section",
    });
  }
};

//update section handler

exports.updateSection = async (req, res) => {
  try {
    //date input
    const { sectionName, sectionId } = req.body;

    //validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "missing properties",
      });
    }

    //update data
    const section = await findByIdAndUpdate(
      { sectionId },
      { sectionName },
      { new: true }
    );

    //return res
    return res.status(200).json({
      success: true,
      message: "section updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "unable to update section",
    });
  }
};

//delete section handler

exports.deleteSection = async (req, res) => {
  try {
    //fetch data/get Id--assuming that we are sending id in params

    const { sectionId } = req.params;

    //use find id and delete
    await Section.findByIdAndDelete({ sectionId });
    //return res
    return res.status(200).json({
      success: true,
      message: "section deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "unable to delete section",
    });
  }
};
