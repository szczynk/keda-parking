const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Park } = require('../models');
const ApiError = require('../utils/ApiError');

const createPark = async (parkBody) => {
  return Park.create(parkBody);
};

const queryParks = async (filter, options) => {
  const condition = {
    ...(filter.plat && { plat: { [Op.substring]: filter.plat } }),
    ...(filter.tipe && { tipe: filter.tipe }),
    ...(filter.masuk && { masuk: filter.masuk }),
    ...(filter.keluar && { keluar: filter.keluar }),
    ...(filter.harga && { harga: filter.harga }),
  };

  const sort = options.sortBy
    ? options.sortBy.split(/(?:,|:)+/)
    : ['createdAt', 'DESC'];
  const limit =
    options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10;
  const page =
    options.page && parseInt(options.page, 10) > 0
      ? parseInt(options.page, 10)
      : 1;
  const offset = (page - 1) * limit;

  const parks = await Park.findAndCountAll({
    where: condition,
    limit,
    offset,
    order: [sort],
  }); // count and rows

  return Promise.all([parks]).then((values) => {
    const [results] = values;
    const { rows } = results;
    const totalRows = results.count;
    const totalPages = Math.ceil(totalRows / limit);
    const result = {
      rows,
      page,
      limit,
      totalPages,
      totalRows,
    };
    return Promise.resolve(result);
  });
};

const getParkById = async (id) => {
  return Park.findOne({ where: { id } });
};

const updateParkById = async (parkId, updateBody) => {
  const [updated] = await Park.update(updateBody, {
    where: { id: parkId },
  });
  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Park not found');
  }
  const updatedPark = await getParkById(parkId);
  return updatedPark;
};

const deleteParkById = async (parkId) => {
  const deletedPark = await Park.destroy({
    where: { id: parkId },
  });
  if (!deletedPark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Park not found');
  }
  return deletedPark;
};

module.exports = {
  createPark,
  queryParks,
  getParkById,
  updateParkById,
  deleteParkById,
};
