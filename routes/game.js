var express = require('express');
var router = express.Router();
var stackModel = require('../model/stack');
var tableModel = require('../model/game');
var Q = require("q");
var MongoClient = require("mongodb").MongoClient;
var databaseUrl = "mongodb://localhost:27017/blackjack";

//Connect to database and get collection

function getdb(collName) {
    var deferred = Q.defer();
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            console.log("Problem connecting database");
            deferred.reject(new Error(err));
        } else {


            var collection = db.collection(collName, {
                capped: true,
                size: 100000
            });
            deferred.resolve(collection);
        }
    });
    return deferred.promise;
}

function generateTableName() {
    var temp = Date.now();
    return (temp.toString(36));

}

/* GET home page. */
router.get('/', function(req, res, next) {
    // createNewTable().then(function(table){
    //    console.log(table) ;
    //    res.end("check console");
    //});



    findTableForMe().then(function(table){

        var player = { "playerId" : "1", "playerName" : "vishal", "playerMoney" : 500, "_id" : "55397f6f4632e8ff4f2a7c87" };
        addMeToTable(player,table).then(function(newTable){
            console.log(newTable);
            res.end("check console");
        });

    }).fail(function(err){
        console.log("error is here 1");
        console.log(err);
        res.end("Error accured");
    });

});

function createNewTable(){
    var deferred = Q.defer();
    var stack = new stackModel.Stack();
    stack.makeDeck(2);
    stack.shuffle(5);
    var table = {
        tableName: generateTableName(),
        players:[],
        numberOfPlayer: 0,
        dealer : null,
        stack: stack
    };

    getdb("table").then(function(collection) {

        collection.insert(table,function(err,result){
            if(err){
                console.log(err);
                deferred.reject(new Error(err));
            } else{
                // console.log(result);
                deferred.resolve(result.ops[0]);

            }
        });

    }).fail(function(err){
        deferred.reject(new Error(err));
    });
    return deferred.promise;

}

function addMeToTable(player,table){

    var deferred = Q.defer();

    getdb("table").then(function(collection){

        collection.find({tableName:table.tableName}).limit(1).toArray(function(err,tables){
            if(err){
                console.log("problem is here");
                deferred.reject(new Error(err));
            } else{

                if(table.length===0){
                    deferred.reject(new Error("table Not available to update"));
                }else{
                    tables[0].players.push(player);
                    
                    collection.findAndModify({tableName:tables[0].tableName},[],tables[0],{new:false},function(err,table){
                        if(err){
                            deferred.reject(new Error(err));
                        }else{
                            deferred.resolve(table.value);
                        }
                    });
                }
            }
        });


    }).fail(function(err){

        deferred.reject(new Error(err));
    });
    return deferred.promise;
}


function getPlayer(playerId){

}

function findTableForMe(){

    var deferred = Q.defer();

    getdb("table").then(function(collection){

        collection.find({ numberOfPlayer:{$lt:3}}).limit(1).toArray(function(err,tables){
            if(err){
                deferred.reject(new Error(err));
            }else{

                if(tables.length===0){
                    //No table available. Create New 
                    createNewTable().then(function(table){
                        deferred.resolve(table); 
                    });
                }else{
                    //Table Available

                    deferred.resolve(tables[0]);
                }
            }
        });


    }).fail(function(err){

        deferred.reject(new Error(err));
    });

    return deferred.promise;
}

module.exports = router;
