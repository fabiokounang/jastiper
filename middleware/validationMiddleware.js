const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).render("errors/422", {
    title: "Validation Error",
    errors: errors.array(),
  });
};
