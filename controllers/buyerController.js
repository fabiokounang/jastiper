exports.dashboard = (_req, res) => {
  res.render("buyer/dashboard", {
    title: "Buyer Dashboard",
  });
};

exports.profile = (_req, res) => {
  res.render("buyer/profile", {
    title: "Buyer Profile",
  });
};
