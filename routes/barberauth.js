const express = require("express")
const router = express.Router()
const Barber = require("../models/Barber")
const BarberCounter = require("../models/BarberCounter")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchUser = require("../middleware/fetchUser.js")
const JWT_SECRET = "Amanisagoodbo$y"

// ROUTE 1: Create a Barber using:POST "/api/barberauth/createbarber". No login required
router.post("/createbarber", [body('email', "Enter a valid email").isEmail(), body('name', "Enter a valid name").isLength({ min: 3 }), body('password', "Password must be atleast 5 characters").isLength({ min: 5 }), body('zip').custom((value, { req }) => {
    var a = /(^\d{6}$)/;
    if (a.test(value)) {
        return true
    }
    else {
        return false
    }
}),body('phone').custom(function validatePhone(phone) { //Validates the phone number
    var phoneRegex = /^(\+91-|\+91|0)?\d{10}$/; // Change this regex based on requirement
    return phoneRegex.test(phone);
})
], async (req, res) => {
    let success = false;
    //If there are errors, return Bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    //Check weather the barber with this email exists already
    try {
        let barber = await Barber.findOne({ email: req.body.email })
        if (barber) {
            return res.status(400).json({ success, error: "Sorry a barber with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt)
        req.body.password = secPass
        await BarberCounter.updateOne(
            { _id: '6556345f9bfce327e5b714af' },
            {
                $inc: { value: 1 },
                $currentDate: { lastModified: true }
            }
        );
        let counter = await BarberCounter.findById("6556345f9bfce327e5b714af")
        const barberObj = { ...req.body, shopnumber: counter.value }
        barber = await Barber.create(barberObj)
        const data = {
            id: barber.id
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 2: Authenticate a Barber using:POST "/api/barberauth/loginbarber". Login required
router.post("/loginbarber", [body('email', "Enter a valid email").isEmail(), body('password', "Password cannot be blank").exists()
], async (req, res) => {
    //If there are errors, return Bad request and the errors
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body
    try {
        let barber = await Barber.findOne({ email })
        if (!barber) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, barber.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" })
        }
        const data = {
            id: barber.id
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 3: Authenticate a User using:POST "/api/auth/getUser". Login required
router.post('/getUser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await Barber.findById(userId).select("-password")
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 4: Update a Barber working hours and working days using:PUT "/api/auth/ubworking". Login required
router.put("/ubworking", fetchUser,[body('email', "Enter a valid email").isEmail(), body('name', "Enter a valid name").isLength({ min: 3 }), body('zip').custom((value, { req }) => {
    var a = /(^\d{6}$)/;
    if (a.test(value)) {
        return true
    }
    else {
        return false
    }
}),body('phone').custom(function validatePhone(phone) { //Validates the phone number
    var phoneRegex = /^(\+91-|\+91|0)?\d{10}$/; // Change this regex based on requirement
    return phoneRegex.test(phone);
})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name,phone,website,type,email,address,city,state,zip,workinghoursfrom,workinghoursto,workingdays } = req.body
        const newBarber = {}
        if (zip) {
            newBarber.zip = zip
        }
        if (state) {
            newBarber.state = state
        }
        if (city) {
            newBarber.city = city
        }
        if (address) {
            newBarber.address = address
        }
        if (email) {
            newBarber.email = email
        }
        if (type) {
            newBarber.type = type
        }
        if (website) {
            newBarber.website = website
        }
        if (name) {
            newBarber.name = name
        }
        if (phone) {
            newBarber.phone = phone
        }
        if (workinghoursfrom) {
            newBarber.workinghoursfrom = workinghoursfrom
        }
        if (workinghoursto) {
            newBarber.workinghoursto = workinghoursto
        }
        if (workingdays) {
            newBarber.workingdays = workingdays
        }
        let barber = await Barber.findById(req.user.id)
        if (!barber) {
            return res.status(404).send("Not found")
        }
        if (barber._id.toString() !== req.user.id) {
            res.status(401).send("Not allowed")
        }
        barber = await Barber.findByIdAndUpdate(req.user.id, { $set: newBarber }, { new: true })
        res.json({ barber })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }

})

module.exports = router