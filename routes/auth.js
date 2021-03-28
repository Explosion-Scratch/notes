const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get('/github', passport.authenticate('github', { scope: ['profile'] }), (req, res) => {
	res.redirect('/dashboard')
	return;
})

//GET to dashboard
router.get('/github/callback' , passport.authenticate('github',{ failureRedirect: '/'}),
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