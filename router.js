const passportService = require("./services/passport");
const passport = require("passport");

// middlewares
const requireGoogleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
const requireLogin = require("./middlewares/requireLogin");
const requireCredit = require("./middlewares/requireCredit");

module.exports = function(app) {
  // auth routes
  app.get("/auth/google", requireGoogleAuth);

  app.get("/auth/google/callback", requireGoogleAuth, (req, res) => {
    res.redirect("/surveys");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

};
