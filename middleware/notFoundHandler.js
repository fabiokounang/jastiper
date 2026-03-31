module.exports = (req, res) => {
  return res.status(404).render("errors/404", {
    title: "Not Found",
    message: `Route ${req.originalUrl} does not exist.`,
  });
};
