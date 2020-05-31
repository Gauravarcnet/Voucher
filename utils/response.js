const {
  error
} = require('./logging');


function response() {
  const methods = {
    success: (res, status, data = null, message = 'success') => {
      return res.status(status).json({
        status,
        message,
        data
      });
    },
    
    errors: (res, status, err = {}) => {
      error(err);
      const errors = {
        400: 'Invalid Input',
        500: 'Internal server error',
        403: 'Forbidden',
        401: 'UnAuthorized Access',
      };
      let message = errors[status];
      if (Array.isArray(message))
        message = message[0];
      return res.status(status).json({
        status,
        message,
        err
      });
    }
  };

  return Object.freeze(methods);
}

module.exports = response();
