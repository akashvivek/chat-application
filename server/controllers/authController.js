const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const checkUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            message: "Email is required",
            success: false
        })
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User Not found",
            success: false
        })
    } else {
        return res.status(200).json({
            message: "User found",
            data: user,
            success: true,
        });
    }


});

const registerUser = async(req,res,next)=>{
    try {
        const{name,email,image:profileImage,about}=req.body

        if (!email || !name || !profileImage) {
            return res.status(400).json({
                message: "Email, Name and Profile pic are required",
                success: false
            })
        }
        
        const userExists = await User.findOne({ email });

        if (userExists) {
         return res.status(400).json({
            message:"user already exist",
            success:false
         })
        }
        const user = await User.create({
            name,
            email,
            profileImage,
            about
          });
          console.log(user)

          if (user) {
            return res.status(200).json({
                message: "User Added",
                success: true,
                data:user
            })
        }  
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        })
    }
}

const getAllUsers = async(req,res,next)=>{
    try {
        const allUser = await User.find().sort({name: 1})

        const userGroupByInitialLetter = {};
        allUser.forEach((user)=>{
            const initialLetter = user.name.charAt(0).toUpperCase();
            if(!userGroupByInitialLetter[initialLetter]){
                userGroupByInitialLetter[initialLetter] = [];
            }
            userGroupByInitialLetter[initialLetter].push(user);
        })
        return res.status(200).json({
            message: "All users",
            success: true,
            users:userGroupByInitialLetter
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        })
    }
}

module.exports = { checkUser ,registerUser , getAllUsers};
