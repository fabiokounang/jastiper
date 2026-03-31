const { ROLES } = require("../config/constants");

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash("error", "Please login first.");
      return res.redirect("/login");
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render("errors/403", {
        title: "Forbidden",
        message: "You are not allowed to access this page.",
      });
    }

    return next();
  };
};

module.exports = {
  allowAdmin: allowRoles(ROLES.ADMIN),
  allowJastiper: allowRoles(ROLES.JASTIPER),
  allowBuyer: allowRoles(ROLES.BUYER),
  allowRoles,
};
