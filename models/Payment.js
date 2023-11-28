const mongoose = require("mongoose")
const { Schema } = mongoose;

const UserSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "barber"
    },
    name: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    amount:{
        type:String,
        required:true
    }

})
const User = mongoose.model("user", UserSchema)
module.exports = User