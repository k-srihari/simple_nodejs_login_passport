import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'

export function initialise(passpord, getUserByEmail, getUserByID) {
  async function doAuthenticate(email, pwd, done) {
    let theUser = getUserByEmail(email)
    if (!theUser) {
      return done(null, false, {
        message: 'Sorry, there is no user found with the given email ID!',
      })
    }
    try {
      if (await bcrypt.compare(pwd, theUser.password)) {
        done(null, theUser)
      } else {
        done(null, false, {
          message: 'Oops! The password you entered was incorrect!',
        })
      }
    } catch (error) {
      done(error)
    }
  }

  passpord.use(new LocalStrategy({ usernameField: 'emailad' }, doAuthenticate))

  passpord.serializeUser((theUser, done) => {
    return done(null, theUser.userID)
  })
  passpord.deserializeUser((id, done) => {
    return done(null, getUserByID(id))
  })
}
