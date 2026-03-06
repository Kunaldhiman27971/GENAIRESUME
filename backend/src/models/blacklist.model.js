const mongoose=require('mongoose');

const blacklistTokenSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true, "Token is required to be added to the blacklist"]
    }
},{
    timestamps:true
})

const blackListModel=mongoose.model('blacklistToken',blacklistTokenSchema);

module.exports=blackListModel;