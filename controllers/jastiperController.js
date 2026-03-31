exports.dashboard = (_req, res) => {
  res.render("jastiper/dashboard", {
    title: "Jastiper Dashboard",
  });
};

exports.profile = (_req, res) => {
  res.render("jastiper/profile", {
    title: "Jastiper Profile",
  });
};
