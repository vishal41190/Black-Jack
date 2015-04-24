var express = require('express');
var Q = require("q");
var MongoClient = require("mongodb").MongoClient;
var databaseUrl = "mongodb://localhost:27017/blackjack";
var router = express.Router();
var playerModule= require('../model/player');
function getdb() {
    var deferred = Q.defer();
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            console.log("Problem connecting database");
            deferred.reject(new Error(err));
        } else {


            var collection = db.collection("player", {
                capped: true,
                size: 100000
            });
            deferred.resolve(collection);
        }
    });
    return deferred.promise;
}
router.get('/newPlayer',function(req,res){
    var player;// = new playerModule.player();
    player=playerModule.newPlayer("1","vishal",500);
    console.log(player);
     getdb().then(function(collection) {
                        collection.insert(player, function(err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                
                                res.end("New player added");
                            }
                        });
                    }).fail(function(err) {
                        res.status(404).send("Problem connecting database");
                    });
});

module.exports = router;