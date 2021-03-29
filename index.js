const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const methodOverride = require("method-override");
const formatDate = require("./helpers/formatDate");
const app = express();
const User = require('./models/User.js')
const PORT = 3000;

//passport config
require("./config/passport")(passport);

//load dotenv config.
dotenv.config();
connectDB();
User.deleteOne({ name: 'GrahamSH' });

//handlebars
const dateTime = require("./helpers/dateTime")
app.engine(
  ".hbs",
  exphbs({ defaultLayout: "main", extname: ".hbs", helpers: { formatDate, dateTime } })
);
app.set("view engine", ".hbs");

//bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride());
app.use(
  methodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
//Express sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongooseConnection: mongoose.connection,
      mongoUrl: process.env.MONGO_URI
    })
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/notes", require("./routes/notes"));
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).redirect('/')
})
app.listen(PORT, console.log("LIstening at port 3000"));
