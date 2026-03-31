exports.showLogin = (_req, res) => {
  return res.render("auth/login", {
    title: "Login",
  });
};

exports.showRegister = (_req, res) => {
  return res.render("auth/register", {
    title: "Register",
  });
};

exports.login = (_req, res) => {
  return res.status(501).send("Login will be implemented in Stage 2.");
};

exports.register = (_req, res) => {
  return res.status(501).send("Registration will be implemented in Stage 2.");
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("jastip.sid");
    res.redirect("/login");
  });
};
