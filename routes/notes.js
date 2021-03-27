const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const router = express.Router();
const Note = require('../models/Note');

//GET to dashboard
router.get('/add', ensureAuth, (req, res) => {
  res.render('notes/add');
});

router.post('/add', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user._id;
    console.log(req.body);
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
		note.body = sanitizeHtml(converter.makeHtml(note.body));
		console.log(note.body)
		let deleteBtn = false;
		if (note.user == (req.user ? req.user.id : "Never gonna give you up, never gonna get this ID")){
			deleteBtn = true;
		}
    console.log(note);
    res.render('notes/read', { note, deleteBtn: deleteBtn });
  } catch (err) {
    console.log(err);
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
	const note = await Note.findById(req.params.id).lean();
	if (note.user != req.user.id){
			res.redirect("/dashboard");
			return;
	}
  try {
    console.log(req.body);
    await Note.findOneAndUpdate(
      { _id: req.params.id },
      { title: req.body.title, body: req.body.body },
    );
    res.redirect('/dashboard');
  } catch (er) {
    console.log(er);
  }
});

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
module.exports = router;