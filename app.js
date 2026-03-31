const path = require("path");
const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const helmet = require("helmet");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
require("dotenv").config();

const attachAuthUser = require("./middleware/attachAuthUser");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");

const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/authRoutes");
const jastiperRoutes = require("./routes/jastiperRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    name: "jastip.sid",
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(flash());
app.use(attachAuthUser);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/jastiper", jastiperRoutes);
app.use("/buyer", buyerRoutes);
app.use("/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
