'use strict'
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const glob = require('glob')
const cors = require('cors')
var appLogger = require('./utils/appLogger')
global.__basedir = __dirname;


const authenticate = require('./utils/authenticate')

/* Protecting headers */
app.use(helmet());

/* Body parser config */
app.use(
  bodyParser.json({
    limit: '50mb'
  })
);

app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use(appLogger.requestDetails(appLogger));

app.use('/public', express.static('public'));
require('./config/db');

/* CORS setup */
//const domain = 'https://domain.com';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); /* *.name.domain for production  */
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});
app.use(cors());

/* Apply error handlers to app */
require('./utils/errorHandler')(app);

/* Log requests to console */
app.use(morgan('dev'));

/* Router setup */
const openRouter = express.Router(); // Open routes
const apiRouter = express.Router(); // Protected routes

/* Fetch router files and apply them to our routers */
glob('./components/*', null, (err, items) => {

  items.forEach(component => {
    require(component).routes && require(component).routes(
      openRouter,
      apiRouter
    );
  });
  
});  

apiRouter.use(authenticate.verifyToken);
app.use('/v1', openRouter);
app.use('/api/v1', apiRouter);

module.exports = app;