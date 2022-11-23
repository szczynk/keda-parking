const express = require('express');

const router = express.Router();

const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');

router.route('/').get(
  catchAsync(async (req, res) => {
    res.status(httpStatus.OK).send({
      status: 'online',
      'Made with ❤ by': 'sanguinary-bus',
      timestamp: moment(new Date()).format('LLLL'),
    });
  })
);

module.exports = router;
