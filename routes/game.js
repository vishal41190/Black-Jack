var express = require('express');
var router = express.Router();
var stackModel = require('../model/stack');
var tableModel = require('../model/game');
/* GET home page. */
router.get('/', function(req, res, next) {
    var table = new tableModel.table();
    table.newTable();
    var stack = new stackModel.Stack();
    stack.makeDeck(2);
   stack.shuffle(5);
    
  res.render('index', { title: stack });
});

module.exports = router;
