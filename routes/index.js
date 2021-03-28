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
	var user = await Users.findOne({displayName: req.params.id}).lean();
	if (!user) {
		res.render("profile", {})
	}
	let image = user.image
	var notes = await Note.find({isPublic: true, displayName: req.params.id}).lean();
	var showdown  = require('showdown');
	const sanitizeHtml = require('sanitize-html');
	const converter = new showdown.Converter();
	converter.setFlavor('github');
	notes.map(note => {
		note.body = sanitizeHtml(converter.makeHtml(note.body));
		note.body = deburr(note.body);
		note.title = deburr(note.title);
		return note;
	})
	res.render("profile", {user, notes, image})
})
router.get('/dashboard', ensureAuth, async (req, res) => {
	console.log(req.user)
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