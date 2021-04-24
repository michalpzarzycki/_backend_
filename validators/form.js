const { check } = require('express-validator')

exports.contactFormValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Message must be at least 20 char long')
]


    // .isLength({ min: 20 })
