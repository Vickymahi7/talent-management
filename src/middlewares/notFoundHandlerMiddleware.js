const express = require("express");
const responseCodes = require('../constants/httpResponseCodes.js');

const notFoundHandler = (req, res, next) => {
  const error = new Error("Not found");
  error.status = responseCodes.NOT_FOUND;
  next(error);
};

module.exports = notFoundHandler;
