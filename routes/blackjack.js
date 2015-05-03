var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var playerId= req.session.playerId;
    var playerName =req.session.playerName;// req.body.playerName;
  res.render('blackjack', { playerId: playerId, playerName:playerName });
});

module.exports = router;
