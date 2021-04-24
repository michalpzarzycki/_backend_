const express = require('express');
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { contactForm } = require('../controllers/form');

const router = express.Router()

const { runValidation } = require('../validators/')
const {  contactFormValidator  } = require('../validators/form')
 
router.post('/contact', contactFormValidator, runValidation, contactForm)


module.exports = router;