const GitHubStrategy = require('passport-github').Strategy;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

module.exports = function (passport) {
  passport.use(
    new GitHubStrategy({
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: "https://notes.explosionscratc.repl.co/auth/github/callback"
		},
				async (accessToken, refreshToken, profile, done) => {
					console.log(profile);
        const newUser = {
          googleId: profile.id,
          displayName: profile.username,
          firstName: profile.displayName || profile.username,
          image: profile._json.avatar_url,
					bio: profile._json.bio
        };
				console.log(newUser)
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, newUser);
          }
        } catch (err) {
          console.log(err);
        }
      },
    ),
  );
  passport.serializeUser(async (user, done) => {
		try {
    	done(null, user.id);
		} catch(e){
      console.error(e)
    }
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};