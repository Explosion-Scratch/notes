const express = require('express');
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const router = express.Router();
const Note = require('../models/Note');
const Users = require("../models/User")
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});
router.get("/users/:id", async (req, res) => {
	const user = await Users.find({firstName});
	console.log(user)
	res.json(user)
})
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    var notes = await Note.find({ user: req.user.id }).lean();
		notes = notes.reverse();
    res.render('dashboard', { name: req.user.firstName, notes, imgSrc: req.user.image });
  } catch (err) {
    console.log(err);
  }
});
//TODO: Add notes from other people
router.get("/:id", async (req, res) => {
	res.render("404")
})
module.exports = router;