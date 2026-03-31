const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const old = { ...req.body };
  if (Object.prototype.hasOwnProperty.call(old, "password")) old.password = "";
  if (Object.prototype.hasOwnProperty.call(old, "confirm_password")) old.confirm_password = "";

  if (req.originalUrl === "/login") {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).render("auth/login", {
      title: "Login",
      formData: old,
    });
  }

  if (req.originalUrl === "/register") {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).render("auth/register", {
      title: "Register",
      old,
    });
  }

  if (
    req.originalUrl.includes("/jastiper/trips/create") ||
    req.originalUrl.includes("/jastiper/trips/") ||
    req.originalUrl.includes("/jastiper/products/create") ||
    req.originalUrl.includes("/jastiper/products/")
  ) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("back");
  }

  return res.status(422).render("errors/422", {
    title: "Validation Error",
    errors: errors.array(),
  });
};
