module.exports = (err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err.message && err.message.includes("Only JPG")) {
    req.flash("error", err.message);
    return res.redirect("back");
  }

  return res.status(500).render("errors/500", {
    title: "Server Error",
    message: "Something went wrong. Please try again later.",
  });
};
