const sendError = (statusCode = 500, message = "Something went wrong!") => {
  return {
    statusCode,
    message,
  };
};

module.exports = sendError;
