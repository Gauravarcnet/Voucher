function userRoutes() {
  const ctrl = require('./user.controller')
  const validationCtrl = require('./user.validator')  
  return (open) => {

    //  Using Joi as middlwware before sending req to controller
    open.route('/signUp').post(validationCtrl.signUpValidation,ctrl.createUser) 

    open.route('/login').post(validationCtrl.signInValidation,ctrl.signIn)
  }
}

module.exports = userRoutes()