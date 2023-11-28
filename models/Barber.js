const mongoose = require("mongoose")
const { Schema } = mongoose;



const BarberSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ratings: {
        type: Number,
        required: true,
        default: 0
    },
    phone: {
        type: String,
        required: true
    },
    website: {
        type: String,
        default: "Not available"
    },
    services: {
        type: Array,
        default: [],
        required: true
    },
    type: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    workinghoursfrom: {
        type: String,
        required: true
    },
    workinghoursto: {
        type: String,
        required: true
    },
    shopnumber: {
        type: Number,
        default: 0,
        required: true
    },
    bookingcounter: {
        type: Number,
        required: true,
        default: 0
    },
    reviewcounter: {
        type: Number,
        required: true,
        default: 1
    },
    workingdays: {
        type: Array,
        required: true,
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    reviews: {
        type: Array,
        required: true,
        default: []
    }

})
const Barber = mongoose.model("barber", BarberSchema)
module.exports = Barber