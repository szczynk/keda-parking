const express = require('express');

const statusRoute = require('./status.routes');
const parkRoute = require('./park.routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/status',
    route: statusRoute,
  },

  {
    path: '/parks',
    route: parkRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
