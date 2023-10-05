const express = require("express");
const responseCodes = require('../constants/httpResponseCodes.js');

const errorHandler = (err, req, res, next) => {
  const status = err.status || httpResponseCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ status: status, message: message });
};

module.exports = errorHandler;
