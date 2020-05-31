require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../components/user/user.model');
const {
  errors
} = require('./response');

function authenticate() {
  const methods = {
    verifyToken: async (req, res, next) => {
      try {

        //
        let token = req.headers['x-access-token']

        if (!token)
          return errors(res, 401)
        let decoded = await jwt.verify(token, process.env.secret_key)
        
        let userData = await User.findOne({
          _id: decoded._id,
          $or: [{
            email: decoded.email,
          }]
        }).select('-password').lean();
  
        if (userData) {
          req.user = userData;
          next();
        } else {
          return errors(res, 401);
        }
      } catch (error) {
        return errors(res, 400, 'Invalid token')

      }
      
     
    }
  };
  return Object.freeze(methods);
}
module.exports = authenticate();
