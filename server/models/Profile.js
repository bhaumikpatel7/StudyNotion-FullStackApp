const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender:{
    type:String,
  },
  dateOfbirth:{
    type:String,
  },
  about:{
    type:String,
    trim:true,
  },
  contactNumber:{
    type:Number,
    trim:true,
  }
})

module.exports = mongoose.model("Profile",profileSchema)