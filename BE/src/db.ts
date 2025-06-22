import mongoose, { Model } from "mongoose";

mongoose.connect("mongodb://localhost:27017/")

const userSchema =new  mongoose.Schema({
    username : String ,
    password : String,
    privatekey : String,
    publicKey : String
})

const userModel =mongoose.model("userModel",userSchema);

export default userModel;