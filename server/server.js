const express = require('express');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');

const db = require('./models');
const routes = require('./routes');
const config = require('./config');
const logger = require('./config/logger');
const morgan = require('./config/morgan');
const ignoreFavicon = require('./middlewares/ignoreFavicon');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

let server;

if (config.ENV !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

//* set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

//* sanitize request data
app.use(xss());

//* Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
//* It shows the real origin IP in the heroku or Cloudwatch logs
app.enable('trust proxy');

//* enable cors
app.use(cors());
app.options('*', cors());

//* gzip compression
app.use(compression());

//* parse json request body
app.use(express.json());

//* parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

//* ignoring favicon requests
app.use(ignoreFavicon);

//* send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

//* convert error to ApiError, if needed
app.use(errorConverter);

//* handle error
app.use(errorHandler);

async function startServer() {
  try {
    await db.sequelize.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }

  server = app.listen(config.PORT, () => {
    logger.info(`🛡️ Server listening on port: ${config.PORT} 🛡️`);
  });
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.error('SIGTERM received on Server through app termination');
  if (server) {
    server.close();
  }
});

process.on('SIGINT', () => {
  logger.error('SIGINT received on Server through app termination');
  if (server) {
    server.close();
  }
});

startServer();
