const jwt = require('jsonwebtoken')
const User = require("./user.model")


/* 
    Success and errors are the response method that we have defined 
    already in response So we can follow standward way and error handling
*/
const {
  success,
  errors
} = require('../../utils').response

function userCtrl() {
  const methods = {

    // admin signup 
    createUser: async (req, res) => {
      try {
        let data = req.value

        let {
          generateHash
        } = new User() // destructing generateHash Method from userModel

        let searchQuery = {}
        if (data.email) {
          searchQuery = {}
          searchQuery.email = data.email
        }

        //Check user exist with particular email 
        let user = await User.findOne({
          searchQuery
        }).lean()

        // If user already exist Response with 
        if (user) return errors(res, 400, 'User Already Exist')


        let newUser = new User({
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          password: data.password ? generateHash(data.password) : ''
        })

        await newUser.save()

        return success(res, 200, 'user created succesfully')

      } catch (e) {
        console.log(e)
        throw new Error(e)
      }
    },

    // Login admin 
    signIn: async (req, res) => {
      try {

        let value = req.value

        let user = await User.findOne({
          email: value.email
        })

        // If user does not  exist Response with 
        if (!user) {
          return errors(res, 400, 'user not Found', 'no user found')

        } else {

          //validPassword used for verify password  by encrypting
          if (user.validPassword(value.password)) {

            user.loggedIn = new Date()

            user = await user.save()

            const {
              _id,
              email,
              loggedIn
            } = user.toObject()

            //Creating payload for jwt
            const tokenData = {
              _id,
              email,
              loggedIn
            }

            /* Generating jwt token
               Not using expiry time for jwt token bt we can make expiry
            */
            let token = jwt.sign(tokenData, process.env.secret_key)

            data = {
              token
            }

            return success(res, 200, data, 'user data')

          } else {
            return errors(res, 400, 'Invalid email/Password', 'Invalid email/Password')
          }
        }

      } catch (e) {
        console.log(e)
        return errors(res, 500, e)
      }
    }
  }
  return Object.freeze(methods)
}

module.exports = userCtrl()