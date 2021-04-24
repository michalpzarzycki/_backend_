const { check } = require('express-validator')

exports.userSignupValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage("Name is required"),
    check('email')
    .isEmail()
    .withMessage("Must be a valid email address"),
    check('password')
    .isLength({ min: 6 })
    .withMessage("Pass must be at leats 6 chars long")
]

exports.userSigninValidator = [
    check('email')
    .isEmail()
    .withMessage("Must be a valid email address"),
    check('password')
    .isLength({ min: 6 })
    .withMessage("Pass must be  at leats 6 chars long")
]

