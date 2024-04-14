const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    categoryID:{
        type: Array,
        default:[]
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


module.exports = mongoose.model("question", questionSchema)