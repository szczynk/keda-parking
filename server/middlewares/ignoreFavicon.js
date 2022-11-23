const httpStatus = require('http-status');

const ignoreFavicon = (req, res, next) => {
  if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
    return res.status(httpStatus.NO_CONTENT).end();
  }
  return next();
};

module.exports = ignoreFavicon;
