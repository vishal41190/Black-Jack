var express = require('express');
var router = express.Router();
var stackModel = require('../model/stack');
/* GET home page. */
router.get('/', function(req, res, next) {
    var stack = new stackModel.Stack();
    stack.makeDeck(1);
    stack.shuffle(5);
    console.log(stack.cards);
  res.render('index', { title: stack });
});

module.exports = router;
