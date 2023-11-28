const mongoose = require("mongoose")
const { Schema } = mongoose;

const AppointmentsSchema = new Schema({
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
    phone: {
        type: String,
        required: true
    },
    services: {
        type: Array,
        default: [],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    bookingid: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    barbername: {
        type: String,
        required: true
    },
    barberphone: {
        type: String,
        required: true
    },
    barberwebsite: {
        type: String,
        default: "Not available"
    },
    barberemail: {
        type: String,
        required: true,
    },
    barberaddress: {
        type: String,
        required: true
    },
    servicetype: {
        type: String,
        required: true
    },
    status: {
        type: String,
        require: true,
        default: "Pending"
    },
    total: {
        type: String,
    },
    shopconfirmation:{
        type:String,
        required:true,
        default:"Waiting for confirmation"
    }

})

const Appointment = mongoose.model("appointment", AppointmentsSchema)
module.exports = Appointment