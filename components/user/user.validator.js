const BaseJoi = require('joi')
const Extension = require('joi-date-extensions')
const Joi = BaseJoi.extend(Extension)

/* 
    Success and errors are the response method that we have defined 
    already in response So we can follow standward way and error handling
*/
const { success, errors} = require('../../utils').response

function validationCtrl() {
  const methods = {
    signUpValidation: async (req, res, next) => {
      try {
        let data = req.body
        let schema = Joi.object().keys({
        firstName: Joi.string()
            .trim()
            .required(),    
        lastName: Joi.string()
            .trim()
            .required(),
        email: Joi.string()
            .email()
            .trim()
            .required(),
        password: Joi.string()
            .trim()
        })

        let { error, value } = Joi.validate(req.body, schema, {
          abortEarly: false
        })

        if (error) return errors(res, 400, 'parameters are missing', error.details.map(x => x.message));
        // if (!req.headers['platform'])  return errors(res, 401, 'internal server error', 'platform us mandatory');

        //   req.platform = req.headers['platform'];
        
          req.value = value
          next()
        
      } catch (e) {
        return errors(res, 500, e)
      }
    },
    signInValidation: async (req, res, next) => {
        try {
          let schema = Joi.object().keys({
            email: Joi.string()
              .trim()
              .label('email'),
            password: Joi.string()
              .trim()
              .label('password')
              .required()
          })
  
          let { error, value } = Joi.validate(req.body, schema, {
            abortEarly: false
          })
  
          if (error) return errors(res, 400, 'parameters are missing', error.details.map(x => x.message))
          else {
            req.value = value
            next()
          }
        } catch (e) {
          return success(res, 500, e)
        }
      },
  }

  return Object.freeze(methods)
}

module.exports = validationCtrl()
