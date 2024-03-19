const jwt = require('jsonwebtoken');
require('dontenv').config();
const User = require('../models/User');

exports.auth = async(req, res, next) => {
    try{
        const token = req.cookies.token 
                      || req.body.token 
                      || req.header("Authorization").replace("Bearer " + "");
        
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }
        //verify token form secretkey
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success: false,
                message: "token not valid"
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: "somthing went wrong"
        })
    }
}


exports.isStudent = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: "this is a protected route for student" 
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified"
        })
    }
}

exports.isInstructor = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Instructor" 
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified"
        })
    }
}

exports.isAdmin = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Admin" 
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified"
        })
    }
}