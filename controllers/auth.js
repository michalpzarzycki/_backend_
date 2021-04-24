const User = require('../models/user')
const shortId = require('shortid')
const user = require('../models/user')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
 exports.signup = (req, res) => {
  User.findOne({email: req.body.email}).exec((err, user) => {
    if(user) {
      return res.status(400).json({
        error: "email is taken"
      })
    }
    const { name, email, password } = req.body;
    let username = shortId.generate();
    let profile = `${process.env.CLIEnT_URL}/profile/${username}`

    let newUser = new User({name, email, password, profile, username})
    newUser.save((err, success) => {
      if(err) {
        return res.status(400).json({
          error: err
        })
      }
      res.json({
        message: "Signup succes. Please Sign In"
      })
    })
  })
    }



exports.signin = (req, res) => {
  const { email, password } = req.body;
  //check if user exists
  User.findOne({email}).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: "User email do not exists. Please signup"
      })
    }
     //authenticate
     if(!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and pass do not match"
      }) 
    }
  //generate a token and send to client
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

    res.cookie('token', token, {expiresIn: '1d'})

    const { _id, username, name, email, role} = user;
    return res.json({
      token, user
    })

  })
 
}

exports.signout = (req, res) => {
  res.clearCookie("token")
  res.json({
    message: "signout success"
  })
}

exports.requireSignin = expressJwt({
  secret:process.env.JWT_SECRET,
  algorithms: ['sha1', 'RS256', 'HS256'],

})


exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({_id: authUserId}).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'USer not found'
      })
    }
    req.profile = user;
    next()
  })
}
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({_id: adminUserId}).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'USer not found'
      })
    }

    if(user.role !== 1) {
      return res.status(400).json({
        error: 'Admin resource access denied'
      })
    }
    req.profile = user;
    next()
  })
}