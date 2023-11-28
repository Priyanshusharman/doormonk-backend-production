const mongoose = require("mongoose")
const { Schema } = mongoose;



const BarberCounterSchema = new Schema({
    value: {
        type: Number,
    }
})
const BarberCounter = mongoose.model("barbercounter", BarberCounterSchema)
module.exports = BarberCounter