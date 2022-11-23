const express = require('express');
const validate = require('../middlewares/validate');
const parkController = require('../controllers/park.controller');
const parkValidation = require('../validations/park.validation');

const router = express.Router();
router
  .route('/')
  .post(validate(parkValidation.createPark), parkController.createPark)
  .get(validate(parkValidation.getParks), parkController.getParks);

router
  .route('/:parkId')
  .get(validate(parkValidation.getPark), parkController.getPark)
  .patch(validate(parkValidation.updatePark), parkController.updatePark)
  .delete(validate(parkValidation.deletePark), parkController.deletePark);

module.exports = router;
