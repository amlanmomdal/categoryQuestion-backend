const mongoose = require("mongoose")
const passwordHash = require("password-hash");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    fristName: {
        type: String
    },
    lastName: {
        type: String
    },
    password:{
        type: String
    },
    profileImage: {
        type: String,
        default: "https://cdn.imgbin.com/5/6/23/imgbin-computer-icons-avatar-user-profile-avatar-GHAXcd0jhNHcF0KLRkgjBDLPL.jpg" // admin default image 
    },    
    status: {
        type: Boolean,
        default: true
    },
    token:{
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: new Date()
    },
    updatedOn: {
        type: Date,
        default: new Date()
    }
})

UserSchema.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
};

module.exports = mongoose.model("user", UserSchema)