const passport = require("passport");
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// serializeUser creates some unique identifying piece of information about a user (like a jwt token does) and lets us put it in a cookie
passport.serializeUser((user, done) => {
  done(null, user.id); // this is the mongodb id, not the google id (as some users might use facebook oauth etc.)
});

// deserializeUser decodes cookies to give us the id of the user which we can then use to grab the user's details from the db
passport.deserializeUser(async (id, done) => {
  try {
    const existingUser = await User.findById(id);
    done(null, existingUser);
  } catch (err) {
    done(err, false);
  }
});

// Google OAuth strategy
const googleOptions = {
  clientID: process.env.GOOGLE_OAUTH_ID,
  clientSecret: process.env.GOOGLE_OAUTH_SECRET,
  callbackURL: "/auth/google/callback"
};

const googleLogin = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
  const googleID = profile.id;
  const email = profile.emails[0]["value"];

  try {
    const existingUser = await User.findOne({ googleID: googleID });
    if (existingUser) {
      return done(null, existingUser); // if user is found, call done with no error and the user data
    }
    const newUser = await new User({ email: email, googleID: googleID }).save();
    done(null, newUser);
  } catch (err) {
    done(err, false);
  }
});

passport.use(googleLogin);
