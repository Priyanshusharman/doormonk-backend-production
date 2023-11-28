const express = require("express")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchUser.js")
const Barber = require("../models/Barber")
const Appointment = require("../models/Appointments.js");
const User = require("../models/User")
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new twilio(accountSid, authToken);


// ROUTE 1: Get All the Shops City wise using:POST "/api/shops/fetchallshops". Login required
router.post("/fetchallshops", fetchUser, async (req, res) => {
    try {
        const shops = await Barber.find({ city: req.body.city }).select(["ratings","name", "phone", "website", "services", "type", "email", "address", "city", "state", "zip", "workinghoursfrom","workinghoursto", "workingdays"])
        if (req.body.date.length > 0) {
            const shopsbyday = shops.filter((shop) => {
                return shop.workingdays.includes(req.body.date)
            })
            res.json(shopsbyday)
            return
        }
        res.json(shops)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 2 : Get All the Appointments User wise using:GET "/api/shops/fetchallappointments". Login required
router.get("/fetchallappointments", fetchUser, async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user.id }).select(["shopconfirmation","total","name", "barber", "phone", "services", "email", "address", "time", "barbername", "barberphone", "barberwebsite", "barberemail", "barberaddress", "servicetype", "bookingid", "status", "date"]).sort({ date: 1,time:1 })
        res.json(appointments)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 3: Add an appointment:POST "/api/shops/addappointment". Login required
router.post("/addappointment/:id", fetchUser, [body('time', "Enter a valid time").isLength({ min: 3 })], async (req, res) => {
    const { name, phone, services, email, address, time, date, servicetype } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await Barber.updateOne(
            { _id: req.params.id },
            {
                $inc: { bookingcounter: 1 },
                $currentDate: { lastModified: true }
            }
        );
        const barber = await Barber.findById(req.params.id)

        const appointment = await Appointment.create({
            bookingid: barber.bookingcounter, user: req.user.id, barber: req.params.id, name, phone, services, email, address, time, date, barbername: barber.name, barberphone: barber.phone, barberwebsite: barber.website, barberemail: barber.email, barberaddress: barber.address, servicetype, services: req.body.added, total: req.body.total
        })

        res.json(appointment)


    }
    catch (error) {

        console.error(error.message)
        res.status(500).send("Internal server error")
    }

})

// ROUTE 4: Update an existing appointment:PUT "/api/shops/updateappointment". Login required
router.put("/updateappointment/:id", fetchUser, async (req, res) => {
    try {
        const { time, date, services } = req.body
        const newAppointment = {}
        if (time) {
            newAppointment.time = time
        }
        if (date) {
            newAppointment.date = date
        }
        let appointment = await Appointment.findById(req.params.id)
        if (!appointment) {
            return res.status(404).send("Not found")
        }
        if (appointment.user.toString() !== req.user.id) {
            res.status(401).send("Not allowed")
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id, { $set: newAppointment }, { new: true })
        res.json({ appointment })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }

})

// ROUTE 5: Delete an existing appointment:DELETE "/api/shops/deleteappointment". Login required
router.put("/deleteappointment/:id", fetchUser, async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id)
        if (!appointment) {
            return res.status(404).send("Not found")
        }
        if (appointment.user.toString() !== req.user.id) {
            res.status(401).send("Not allowed")
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'Canceled' }, { new: true })
        res.json({ success: "Appointment has been canceled", appointment: appointment })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }


})

// ROUTE 6: Get the Shop Prices using:POST "/api/shops/fetchprices". Login required
router.post("/fetchprices", fetchUser, async (req, res) => {
    try {
        const shop = await Barber.find({ _id: req.body.id }).select("services")
        res.json(shop)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 7: Give review and ratings to the shop using:POST "/api/shops/postreview". Login required
router.put("/postreview", fetchUser, [body('reviews', "Enter a valid review").isLength({ min: 3 }), body('ratings', "Enter a valid rating").isLength({ min: 1 })], async (req, res) => {
    const {reviews, ratings, id } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findOne({ _id: req.user.id })
        let barber = await Barber.findOne({ _id: id })
        const revobj = {
            name: user.name,
            rating: ratings,
            review: reviews,
            date:new Date()
        }

        const rev = [...barber.reviews]

        rev.push(revobj)






        barber = await Barber.findByIdAndUpdate(id, { reviews: rev, ratings: (parseInt(ratings, 10) + ((barber.reviewcounter - 1) * barber.ratings)) / barber.reviewcounter, reviewcounter: barber.reviewcounter + 1 }, { new: true })
        res.json(barber)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 8: Get Appointment by bookingid  using:POST "/api/shops/appointmentbyid". Login required
router.post("/appointmentbyid", fetchUser, async (req, res) => {
    try {
        const appointment = await Appointment.find({ barber: req.user.id, bookingid: req.body.bookingid }).select(["shopconfirmation","total","name", "barber", "phone", "services", "email", "address", "time", "barbername", "barberphone", "barberwebsite", "barberemail", "barberaddress", "servicetype", "bookingid", "status", "date"]).sort({ date: -1 })
        res.json(appointment)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 9: Set Appointment Completed:PUT "/api/shops/completed". Login required
router.put("/completed", fetchUser, async (req, res) => {
    try {
        const {id,status}=req.body
        const appointment = await Appointment.findByIdAndUpdate(id,{status:status})
        res.json(appointment)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 10: Get All the Appointmnets day wise using:POST "/api/shops/fetchappbyday". Login required
router.post("/fetchappbyday", fetchUser, async (req, res) => {
    try {
        const appointments = await Appointment.find({barber:req.user.id,date:req.body.date}).select(["shopconfirmation","total","name", "barber", "phone", "services", "email", "address", "time", "barbername", "barberphone", "barberwebsite", "barberemail", "barberaddress", "servicetype", "bookingid", "status", "date"]).sort({ date: -1 })
        res.json(appointments)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 10: Confirm or cancel all appointments on a particular day :PUT "/api/shops/shopstatusday". Login required
router.put("/shopstatusday", fetchUser, async (req, res) => {
    try {
        const {date,status}=req.body
        const appointments=await Appointment.updateMany(
            { barber: req.user.id,date:date },
            {
              $set: { shopconfirmation:status },
              $currentDate: { lastModified: true }
            }
          );
        res.json(appointments)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 11: Confirm or cancel a appointment on a particular day:PUT "/api/shops/completed". Login required
router.put("/shopstatusitem", fetchUser, async (req, res) => {
    try {
        const {id,status}=req.body
        const appointment = await Appointment.findByIdAndUpdate(id,{shopconfirmation:status})
        res.json(appointment)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

module.exports = router;