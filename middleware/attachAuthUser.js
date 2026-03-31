module.exports = (req, res, next) => {
  res.locals.authUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
};
