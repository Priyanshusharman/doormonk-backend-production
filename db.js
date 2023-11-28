const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://Doormonk:Tleklu0wPvqOjuSG@doormonk.ajlmam6.mongodb.net/?retryWrites=true&w=majority";

const connectToMongo = () => {
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 })
    .then(console.log("Connected To Mongo Successfully"));
}




module.exports = connectToMongo;