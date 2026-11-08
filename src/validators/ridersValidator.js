// Validator de riders (repartidores): body de POST/PUT/PATCH y filtros de GET /api/riders?...
const { AREAS, VEHICLES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const riderSchema = {
  name: { type: "text", min: 2, max: 60 },
  vehicle: { type: "option", options: VEHICLES },
  area: { type: "option", options: AREAS },
  available: { type: "boolean" },
  rating: { type: "number", min: 0, max: 5, decimals: 1 },
};

const riderQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  vehicle: riderSchema.vehicle,
  area: riderSchema.area,
  available: riderSchema.available,
};

const validateRider = (body, options) => validateBody(riderSchema, body, options);
const validateRiderQuery = (query) => validateQuery(riderQuerySchema, query);

module.exports = { validateRider, validateRiderQuery };
