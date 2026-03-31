module.exports = (req, res, next) => {
  res.locals.authUser = req.session.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
};
