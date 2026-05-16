const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const response = {
    message: statusCode === 500 ? "Internal server error" : error.message
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    response.error = error.message;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
