const Joi = require('joi');

const createPark = {
  body: Joi.object().keys({
    plat: Joi.string().required(),
    tipe: Joi.string().required().valid('mobil', 'motor'),
    masuk: Joi.date().required(),
    keluar: Joi.date().required(),
  }),
};

const getParks = {
  query: Joi.object().keys({
    plat: Joi.string(),
    tipe: Joi.string().valid('mobil', 'motor'),
    masuk: Joi.date(),
    keluar: Joi.date(),
    harga: Joi.number(),

    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPark = {
  params: Joi.object().keys({
    parkId: Joi.number(),
  }),
};

const updatePark = {
  params: Joi.object().keys({
    parkId: Joi.number().required(),
  }),
  body: Joi.object()
    .keys({
      plat: Joi.string(),
      tipe: Joi.string().valid('mobil', 'motor'),
      masuk: Joi.date(),
      keluar: Joi.date(),
      harga: Joi.number(),
    })
    .min(1),
};

const deletePark = {
  params: Joi.object().keys({
    parkId: Joi.number(),
  }),
};

module.exports = {
  createPark,
  getParks,
  getPark,
  updatePark,
  deletePark,
};
