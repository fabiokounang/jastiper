exports.dashboard = (_req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
  });
};

exports.users = (_req, res) => {
  res.render("admin/users", {
    title: "User Monitoring",
  });
};
