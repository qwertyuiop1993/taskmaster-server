const passportService = require("./services/passport");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Survey = require("./models/Survey");

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

  // payment routes
  app.post("/api/stripe", requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: "gbp",
      source: req.body.id, // token obtained with Stripe.js
      description: `Charge for ${req.body.email}`
    });
    // update user's credits
    req.user.credits += 5;
    const updatedUser = await req.user.save();
    // send the updated user to the client
    res.send(updatedUser);
  });

  // survey routes
  app.post("/api/surveys", requireLogin, requireCredit, (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const newSurvey = newSurvey({
      title,
      subject,
      body,
      recipients: recipients.split(",").map((email) => ({ email: email.trim() })), // map array of emails to object containing email key value pair
      _user: req.user.id,
      dateSent: Date.now()
    })

  });
};
