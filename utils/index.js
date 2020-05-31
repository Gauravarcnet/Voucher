const os = require("os");


function utils() {
  const {
    log
  } = require('./logging')

  const methods = {
    /** Add Decorator fn to prefix router path's
     * @param  {Object} router
     * @returns {Object} router
     */
    routePrefix: router => prefix => route => router.route.call(router, `${prefix}${route}`),

    baseUrl: (url) => {
      switch (process.env.PORT) {
        case '1338':
          url = `${process.env.localBaseUrl}${url}`;
          break;
        case '2058':
          url = `${process.env.stagingBaseUrl}${url}`;
          break;
        case '3000':
          url = `${process.env.stagingLocalBaseUrl}${url}`;
          break;
        default:
          break
      }
      return url;
    },
    log  :require('./logging'),
    authenticate : require('./authenticate'),
    errorHandler : require('./errorHandler'),
    logging : require('./logging'),
    response : require('./response')
  };

  return Object.freeze(methods)
}

module.exports = utils()
