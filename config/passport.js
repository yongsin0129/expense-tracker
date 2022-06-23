const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const usersModel = require('../models/users')
require('dotenv').config()

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  // 設定本地登入策略
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      (req, email, password, done) => {
        usersModel.findOne({ email }).then(user => {
          if (!user) {
            return done(null, false, {
              message: '這個 email 還沒有被註冊'
            })
          }
          bcrypt
            .compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {
                return done(null, false, {
                  message: 'Email 或 Password 不正確.'
                })
              }
              return done(null, user)
            })
            .catch(err => done(err, false))
        })
      }
    )
  )

  // 序列及反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    usersModel.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}