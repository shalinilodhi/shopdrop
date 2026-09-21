// Express 5 forwards errors thrown in async handlers to here
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: err.message || "Server error" });
};

// Build an error that carries an HTTP status
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { errorHandler, httpError };
