import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}
import express from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { initialise } from './ourPassport.js'
import flash from 'express-flash'
import session from 'express-session'
import override from 'method-override'

const app = express()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(override('override_to'))

const allUsers = []

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/login')
}

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  return next()
}

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.userName })
})

app.get('/register', checkNotAuthenticated, (_req, res) => {
  console.log('User Count: ' + allUsers.length)
  res.render('register.ejs')
})

app.get('/login', checkNotAuthenticated, (_req, res) => {
  console.log('User Count: ' + allUsers.length)
  res.render('login.ejs')
})

app.post('/register', async (req, res) => {
  try {
    let hashedPass = await bcrypt.hash(req.body.password, 2)
    let newUser = {
      userID: Date.now().toString(),
      userName: req.body.name,
      emailID: req.body.email,
      password: hashedPass,
    }
    console.log(newUser)
    allUsers.push(newUser)
    res.redirect('/login')
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
)

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

initialise(
  passport,
  (emailID) => allUsers.find((user) => user.emailID === emailID),
  (userID) => allUsers.find((user) => user.userID === userID)
)

app.listen(3300, () => console.log('App is up and running on port: ', 3300))
