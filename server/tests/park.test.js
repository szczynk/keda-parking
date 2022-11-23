const request = require('supertest');

const express = require('express');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');

const db = require('../models');
const routes = require('../routes');
const config = require('../config');
const logger = require('../config/logger');
const morgan = require('../config/morgan');
const ignoreFavicon = require('../middlewares/ignoreFavicon');
const { errorConverter, errorHandler } = require('../middlewares/error');
const ApiError = require('../utils/ApiError');
const { parkRepo } = require('../repositories');

const app = express();

// eslint-disable-next-line no-unused-vars
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
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }

  server = app.listen(config.PORT);
}

startServer();

describe('User routes', () => {
  describe('GET /api/parks', () => {
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/api/parks')
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRows: 2,
      });
      expect(res.body.rows).toHaveLength(2);
      expect(res.body.rows[0]).toEqual({
        id: 1,
        plat: 'B1234ABC',
        tipe: 'mobil',
        masuk: expect.anything(),
        keluar: expect.anything(),
        harga: 10000,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test('should correctly apply filter on plat field', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ plat: 'B1234ABC' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRows: 1,
      });
      expect(res.body.rows).toHaveLength(1);
      expect(res.body.rows[0].id).toBe(1);
    });

    test('should correctly apply filter on tipe field', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ tipe: 'motor' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRows: 1,
      });
      expect(res.body.rows).toHaveLength(1);
      expect(res.body.rows[0].id).toBe(2);
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ sortBy: 'tipe:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRows: 2,
      });
      expect(res.body.rows).toHaveLength(2);
      expect(res.body.rows[0].id).toBe(2);
      expect(res.body.rows[1].id).toBe(1);
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ sortBy: 'tipe:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRows: 2,
      });
      expect(res.body.rows).toHaveLength(2);
      expect(res.body.rows[0].id).toBe(1);
      expect(res.body.rows[1].id).toBe(2);
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalRows: 2,
      });
      expect(res.body.rows).toHaveLength(1);
      expect(res.body.rows[0].id).toBe(1);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      const res = await request(app)
        .get('/api/parks')
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        rows: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalRows: 2,
      });
      expect(res.body.rows).toHaveLength(1);
      expect(res.body.rows[0].id).toBe(2);
    });
  });

  describe('POST /api/parks', () => {
    const newPark3 = {
      plat: 'A1234ACB',
      tipe: 'mobil',
      masuk: '2022-11-21T09:00:00.000Z',
      keluar: '2022-11-22T15:00:00.000Z', // 110000
    };
    const newPark4 = {
      plat: 'BA1234GHD',
      tipe: 'motor',
      masuk: '2022-11-21T09:00:00.000Z',
      keluar: '2022-11-22T15:00:00.000Z', // 52000
    };
    const newPark5 = {
      tipe: 'mobil',
      masuk: '2022-11-21T09:00:00.000Z',
      keluar: '2022-11-22T15:00:00.000Z', // 52000
    };

    test('should return 201 and successfully create new mobil park if data is ok', async () => {
      const res = await request(app)
        .post('/api/parks')
        .send(newPark3)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        plat: newPark3.plat,
        tipe: newPark3.tipe,
        masuk: newPark3.masuk,
        keluar: newPark3.keluar,
        harga: 110000,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const park = await parkRepo.getParkById(res.body.id);
      expect(park).toBeDefined();
    });

    test('should return 201 and successfully create new motor park if data is ok', async () => {
      const res = await request(app)
        .post('/api/parks')
        .send(newPark4)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        plat: newPark4.plat,
        tipe: newPark4.tipe,
        masuk: newPark4.masuk,
        keluar: newPark4.keluar,
        harga: 52000,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const park = await parkRepo.getParkById(res.body.id);
      expect(park).toBeDefined();
    });

    test('should return 400 error if one field is null', async () => {
      await request(app)
        .post('/api/parks')
        .send(newPark5)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/parks/:parkId', () => {
    const park1 = {
      id: 1,
      plat: 'B1234ABC',
      tipe: 'mobil',
      masuk: '2022-11-21T14:09:12.996Z',
      keluar: '2022-11-21T14:09:12.996Z',
      harga: 10000,
    };

    test('should return 200 and the park object if data is ok', async () => {
      const res = await request(app)
        .get(`/api/parks/${park1.id}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: park1.id,
        plat: park1.plat,
        tipe: park1.tipe,
        masuk: expect.anything(),
        keluar: expect.anything(),
        harga: park1.harga,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test('should return 404 error if park is not found', async () => {
      await request(app)
        .get(`/api/parks/5`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if parkId is not a valid', async () => {
      await request(app)
        .get(`/api/parks/invalidId`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /api/parks/:parkId', () => {
    const park1 = {
      id: 1,
      plat: 'B1234ABC',
      tipe: 'mobil',
      masuk: '2022-11-21T14:09:12.996Z',
      keluar: '2022-11-21T14:09:12.996Z',
      harga: 10000,
    };

    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/api/parks/${park1.id}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const park = await parkRepo.getParkById(park1.id);
      expect(park).toBeNull();
    });

    test('should return 404 error if park is not found', async () => {
      await request(app)
        .delete(`/api/parks/5`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if parkId is not a valid', async () => {
      await request(app)
        .delete(`/api/parks/invalidId`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /api/parks/:parkId', () => {
    const park2 = {
      id: 2,
      plat: 'B1323BVA',
      tipe: 'motor',
      masuk: '2022-11-21T16:40:52.423Z',
      keluar: '2022-11-21T16:40:52.423Z',
      harga: 4000,
    };
    const updatedPark2 = {
      harga: 0,
    };

    test('should return 200 if data is ok', async () => {
      const res = await request(app)
        .patch(`/api/parks/${park2.id}`)
        .send(updatedPark2)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: park2.id,
        plat: park2.plat,
        tipe: park2.tipe,
        masuk: expect.anything(),
        keluar: expect.anything(),
        harga: updatedPark2.harga,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const park = await parkRepo.getParkById(res.body.id);
      expect(park).toBeDefined();
    });

    test('should return 404 error if park is not found', async () => {
      await request(app)
        .patch(`/api/parks/5`)
        .send(updatedPark2)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if parkId is not a valid', async () => {
      await request(app)
        .patch(`/api/parks/invalidId`)
        .send(updatedPark2)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
