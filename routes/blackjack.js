var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var playerId= req.session.playerId;
    var playerName =req.session.playerName;// req.body.playerName;
    if(playerId===undefined || playerName===undefined){
        res.redirect("/");
    }else{
    console.log(playerId);
  res.render('blackjack', { playerId: playerId, playerName:playerName });
    }
});

module.exports = router;
