const express = require("express");

const notFoundHandler = (req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
};

module.exports = notFoundHandler;
