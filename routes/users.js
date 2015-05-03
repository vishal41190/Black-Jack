var express = require('express');
var MongoClient = require("mongodb").MongoClient;
var router = express.Router();

var databaseUrl = "mongodb://localhost:27017/blackjack";
/* GET users listing. */
router.post('/', function(req, res, next) {
    
    var playerName = req.body.playerName;
    
    
    req.session.playerId=1234;
    req.session.playerName="vishal";
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            console.log("Problem connecting database");
            res.status(404).send("Problem connecting database");
        } else {

            var collection = db.collection("user",{capped:true,size:100000});
            
            var user = {
                playerId: Date.now(),
                playerName: playerName,
                playerMoney: 435

            };
            
            req.session.playerId=user.playerId;
            req.session.playername=user.playerName;
           // console.log(user);
            collection.insert(user,function(err,result){
                if(err){  
                    console.log(err);
                }else{
                    console.log("successfull insert");
                    console.log(user.playerId);
                    //req.session.playerId = user.playerId;
                   // req.session.playername=user.playerName;
                    res.json({
                        "url":"/blackjack" 
                    });
                }

            });


        }
    });


});

module.exports = router;
