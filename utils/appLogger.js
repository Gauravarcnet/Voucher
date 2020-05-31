require('winston-daily-rotate-file');
var winston = require('winston');

var clientIPAddress = 'Unknown';
var requestId = guid();
var fileStack = '';

//Generate a random request ID for identification
function guid() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 32; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

class CustomLogger {
  constructor() {
    this.logger = null;
    winston.loggers.add('logger', {
      transports: [
        /*new (winston.transports.Console)({
            level: 'info',
            colorize: true
        }),*/

        //new files will be generated each day, the date patter indicates the frequency of creating a file.
        new winston.transports.DailyRotateFile({
          name: 'debug-log',
          filename: 'logs/application-%DATE%.log',
          prepend: true,
          datePattern: 'YYYY-MM-DD',
          format: winston.format.printf(
            info => `${this.getFormattedDate()} | ${fileStack} | ${requestId} | IP - ${clientIPAddress} | [${info.level}] | ${info.message}`
          ),
        })
      ]
    });

    this.logger = winston.loggers.get('logger');
  }


  //Get the file name and line number from which the log is called on
  _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    var callerfile;
    try {
      var err = new Error();
      var currentfile;
      var number;

      Error.prepareStackTrace = function (err, stack) {
        return stack;
      };
      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
        var st = err.stack.shift();
        callerfile = st.getFileName();
        number = st.getLineNumber();
        if (currentfile !== callerfile) break;
      }
    } catch (e) {}

    Error.prepareStackTrace = originalFunc;

    return callerfile.replace(__basedir + '\\', '') + '(' + number + ')';
  }

  //Get a formatted date
  getFormattedDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let sec = date.getSeconds();

    minutes = minutes < 10 ? '0' + minutes : minutes;
    sec = sec < 10 ? '0' + sec : sec;
    let strTime = `${hours}:${minutes}:${sec}`;
    return `${day}/${month}/${year} ${strTime}`;
  }

  //Write an error log
  error(message) {
    fileStack = this._getCallerFile();
    this.logger.error(message);
    return true;
  }

  //Write an info log
  info(message) {
    fileStack = this._getCallerFile();
    this.logger.info(message);
    return true;
  }

  //Function used as an express middleware to capture incoming IP address and request ID
  requestDetails(loggerInstance) {
    return function (req, res, next) {
      //this.clientIPAddress = get_ip(req).clientIp
      try {
        clientIPAddress = get_ip(req).clientIp;
      } catch (e) {

      }
      requestId = guid();
      req.appLogger = loggerInstance;
      next();
    };
  }

  convertMS(milliseconds) {
    let hours, minutes, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;
    return `${hours}:${minutes}:${seconds}`;
  }

}

module.exports = new CustomLogger();
