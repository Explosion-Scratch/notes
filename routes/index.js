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
		res.render("profile", {});
		return;
	}
	let image = user ? user.image : "";
	var notes = await Note.find({isPublic: true, user: user._id}).lean();
	notes.reverse();
	var showdown  = require('showdown');
	const sanitizeHtml = require('sanitize-html');
	const converter = new showdown.Converter();
	converter.setFlavor('github');
	notes.map(note => {
		const {deburr} = require("bijou.js")
		note.body = sanitizeHtml(converter.makeHtml(note.body));
		note.body = deburr(note.body);
		note.title = deburr(note.title);
		return note;
	})
	let isMe = (req.user ? req.user._id : "nothing lmao").toString() == user._id.toString();
	res.render("profile", {user, notes, image, isMe})
})
router.put("/users/update/bio/:id", ensureAuth, async (req, res) => {
	if ((req.user ? req.user._id : "This is a placeholder id =P").toString() == req.params.id.toString()){
		const {deburr} = require("bijou.js")
		console.log(req.body.bio, await Users.findOneAndUpdate({_id: req.params.id}, {bio: deburr(req.body.bio)}))
		res.redirect("/users/" + (await Users.findOne({_id: req.params.id})).displayName)
	}
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