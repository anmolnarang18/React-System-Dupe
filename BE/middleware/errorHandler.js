const notFound = (req, res, next) => {
  console.log("NOT FOUND REQUEST", req);
  const error = "";
  // const error = new Error(`NotFound: ${req?.originalURL || ""}`);
  error.statusCode = 404;
  error.msg = `NotFound: ${req?.originalURL || ""}`;
  // res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode === 200 ? 500 : err.statusCode;
  res.status(statusCode);
  res.status(statusCode).json({
    message: err?.message || "Something went wrong!",
    statusCode,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
