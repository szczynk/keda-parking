const httpStatus = require('http-status');
const moment = require('moment');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { parkRepo } = require('../repositories');

const createPark = catchAsync(async (req, res) => {
  const { plat, tipe, masuk, keluar } = req.body;
  let harga = 0;

  const diff = moment(keluar).unix() - moment(masuk).unix();
  const diffHour = Math.ceil(diff / 3600);

  if (tipe === 'mobil') {
    if (diffHour > 16) {
      harga += 80000 * Math.floor(diffHour / 16) + 5000 * (diffHour % 24);
    } else {
      harga += 5000 * (diffHour % 16);
    }
  } else if (tipe === 'motor') {
    if (diffHour > 16) {
      harga += 40000 * Math.floor(diffHour / 16) + 2000 * (diffHour % 24);
    } else {
      harga += 2000 * (diffHour % 16);
    }
  }

  const park = await parkRepo.createPark({ plat, tipe, masuk, keluar, harga });
  res.status(httpStatus.CREATED).send(park);
});

const getParks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['plat', 'tipe', 'masuk', 'keluar', 'harga']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await parkRepo.queryParks(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getPark = catchAsync(async (req, res) => {
  const park = await parkRepo.getParkById(req.params.parkId);
  if (!park) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Park not found');
  }
  res.status(httpStatus.OK).send(park);
});

const updatePark = catchAsync(async (req, res) => {
  const park = await parkRepo.updateParkById(req.params.parkId, req.body);
  res.status(httpStatus.OK).send(park);
});

const deletePark = catchAsync(async (req, res) => {
  await parkRepo.deleteParkById(req.params.parkId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPark,
  getParks,
  getPark,
  updatePark,
  deletePark,
};
