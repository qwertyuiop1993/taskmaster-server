const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieSession = require("cookie-session");
const passport = require("passport");

require("./config/config.js"); // set up environment variables and ports/databases
const router = require("./router"); // import router with routes

// App setup / middlewares
const app = express();
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("combined")); // logging framework
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
  })
);
app.use(helmet()); // protects against various attacks
app.use(bodyParser.json({ type: "*/*" })); // use bodyParser to parse request as JSON
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // parse req body middleware for form submission

router(app); // call our router with app

// if (process.env.NODE_ENV === "production") {
//   // Express will serve up production assets like main.js or main.css
//   app.use(express.static("taskmaster/build"));
//   // Express will serve up the index.html file if it doesn't recognise the route
//   const path = require("path");
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "taskmaster-client", "build", "index.html"));
//   });
// }

// Database setup
mongoose.Promise = global.Promise; // tell mongoose to use native promise functionality
mongoose.connect(process.env.MONGODB_URI).catch((err) => {
  console.log("There was an error", err);
}); // don't need to pass in a callback for async connect - mongoose takes care of that - can simply start typing new code below

// Server setup
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

module.exports = {
  app: app
};
