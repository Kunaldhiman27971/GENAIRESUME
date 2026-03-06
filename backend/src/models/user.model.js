const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:[true, "Username already exists"]
    },
    email:{
        type:String,
        required:true,
        unique:[true, "Account already exist with Email"]
    },
    password:{
        type:String,
        required:true
    }
})

const userModel=mongoose.model('Users', userSchema)

module.exports=userModel;