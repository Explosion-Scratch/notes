const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

//GET to dashboard
router.get('/google/callback' , passport.authenticate('google',{ failureRedirect: '/'}),
(req,res)=>{
	try{
    res.redirect('/dashboard')
		return;
	} catch(e){
		console.error(e);
		res.redirect('/dashboard')
	}
})

router.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
})

module.exports = router