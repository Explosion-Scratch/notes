const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const {deburr} = require("bijou.js")
const router = express.Router();
const Note = require('../models/Note');

router.get('/add', ensureAuth, (req, res) => {
  res.render('notes/add');
});

router.post('/add', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user._id;
		req.body.isPublic = !!req.body.isPublic
    const note = await Note.create(req.body);
    res.redirect('/notes/view/' + note.id);
  } catch (err) {
    console.log(err);
  }
});
router.get('/view/:id', async (req, res) => {
  try {
		var showdown  = require('showdown');
		const sanitizeHtml = require('sanitize-html');
		const converter = new showdown.Converter();
		converter.setFlavor('github');
    let note = await Note.findById(req.params.id).lean();
		if (!note){
			res.redirect("/dashboard");
			return;
		}
		console.log(req.user, note.user)
		if (!note.isPublic){
			console.log("Note isn't public.")
			if (req.user._id.toString() != note.user.toString()){
				res.render("notes/read", {});
				return;
			}
		}
		await Note.findOneAndUpdate(
			{ _id: req.params.id },
			{views: (note.views || 0) + 1},
		)
		note.body = sanitizeHtml(converter.makeHtml(note.body));
		note.body = deburr(note.body);
		note.title = deburr(note.title);
		let deleteBtn = false;
		if (note.user == (req.user ? req.user.id : "Never gonna give you up, never gonna get this ID")){
			deleteBtn = true;
		}
    res.render('notes/read', { note, deleteBtn: deleteBtn, readTime: readingTime(note.body) });
  } catch (err) {
    console.log(err);
  }
	function readingTime(text) {
			let rt = text.split(/\s+/).length / 233;
			return `${Math.round(rt < 1 ? rt * 60 : rt)} ${rt < 1 ? "second" : "minute"}${Math.round(rt < 1 ? rt * 60 : rt) === 1 ? "" :"s"}`
	}
});
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).lean();
		if (note.user != req.user.id){
			res.redirect("/dashboard");
			return;
		}
    res.render('notes/edit', { note });
  } catch (err) {
    console.log(err);
  }
});
router.put('/:id', ensureAuth, async (req, res) => {
	var note = await Note.findById(req.params.id).lean();
	if (note.user != req.user.id){
			res.redirect("/dashboard");
			return;
	}
  try {
		console.log(`isPublic: ${!!req.body.isPublic}`)
    await Note.findOneAndUpdate(
      { _id: req.params.id },
			{ isPublic: !!req.body.isPublic},
      { title: deburr(req.body.title), body: deburr(req.body.body), dateCreated: Date.now() },
    );
    res.redirect('/dashboard');
  } catch (er) {
    console.log(er);
  }
});
router.get("/recent", ensureAuth, async (req, res) => {
	var notes = await Note.find({isPublic: true}).lean();
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
	res.render("public_notes", {notes})
})
router.delete('/delete/:id', ensureAuth, async (req, res) => {
	const note = await Note.findById(req.params.id).lean();
	if (note.user != req.user.id){
			res.redirect("/dashboard");
			return;
	}
  try {
    await Note.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
  }
});
function type(e) {
	return Object.prototype.toString.call(e).split(" ")[1].replace(/]$/, "");
}
module.exports = router;