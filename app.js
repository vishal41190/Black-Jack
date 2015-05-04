var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var http = require('http');
var socketIo = require("socket.io");
var MongoClient = require("mongodb").MongoClient;
var routes = require('./routes/index');
var users = require('./routes/users');
var game = require('./model/game');
var test = require('./routes/test');
var blackjack = require('./routes/blackjack');
var Q = require("q");
var databaseUrl = "mongodb://localhost:27017/blackjack";
var stackModel = require("./model/stack");
var app = express();
var server = http.createServer(app);
io = socketIo(server);
server.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '123456'
}));
app.use('/', routes);
app.use('/users', users);
app.use('/blackjack',blackjack);

app.use('/test',test);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;


//Other resource
// Card image from http://www.jfitz.com/cards/classic-playing-cards.png



//Socket IO programming
var tables=[];
var sockets={};
var playerSocket={};
function getPlayer(players,plId){

    var temp = players.filter(function(items){
        return items.playerId==plId;
    });
    return temp[0];
}
function getOtherPlayer(players,plId){

    var temp = players.filter(function(items){
        return items.playerId != plId;
    });

    return temp;
}



function getLiveTable(playerId,tableIndex){

    var temp = {};

    var tbl = tables[tableIndex];

    temp.tableName=tbl.tableName;
    temp.player = getPlayer(tbl.players,playerId);
    temp.otherPlayer = getOtherPlayer(tbl.players,playerId);

    temp.dealer = tbl.dealer;

    return temp;

}

function findPlayersFromTable(tableName){
    //Return allPlayers from table
    var table = tables.filter(function(items){
        return items.tableName==tableName; 
    });

    return table.players;
}
function findPlayer(playerId){
    //return player
    for(var i =0; i<tables.length ;i++){
        var elementPos = tables[i].players.map(function(x) {return x.playerId; }).indexOf(playerId);
        if(elementPos>=0){
            return tables[i].players[elementPos];
        }
    }
}
//http://stackoverflow.com/questions/9710315/how-can-i-get-a-key-name-in-a-hash-by-using-its-value
function getKeysForValue(obj, value) {
    var all = [];
    for (var name in obj) {
        if (Object.hasOwnProperty(name) && obj[name] === value) {
            all.push(name);
        }
    }
    return all;
}





function sendUpdateToAllPlayer(tableIndex){
   
    if(tables[tableIndex]!=undefined){
        var players = tables[tableIndex].players;
        var liveTbl;
        for(var i =0 ;i < players.length ; i++){
            liveTbl = getLiveTable(players[i].playerId,tableIndex);
            sockets[players[i].playerId].emit("update",liveTbl);

        }
    }
}
function findTableIndex(tableName){
    var elementPos = tables.map(function(x) {return x.tableName; }).indexOf(tableName);
    return elementPos;
}

function getPlayerFromTable(table,playerId){
    var player = table.players.filter(function(items){
        return items.playerId=playerId;
    });
};

function findPlayerTable(playerId){
    var player;
    for(var i =0 ; i < tables.length ; i++){
        player = tables[i].players.filter(function(player){
            return player.playerId==playerId;
        });
        if(player.length>0){
            return i;
        }
    }
    return null;


}

function removeEmptyTable(){
    for(var i =0; i<tables.length;i++){

        if(tables[i].numberOfPlayer===0){
            tables.splice(i,1);

        }
    }
}

function getCardJSON(x){
    var char = x.charAt(x.length-1);
    var value1;
    var value2;
    if(char==="A"){
        value1=1;
        value2=11;
    }
    else if(char==="J" || char === "Q" || char === "K"){
        value1=10;
        value2=10;
    }
    else if(char === "0"){
        value1=10;
        value2=10;
    }
    else{
        value1=parseInt(char);
        value2=parseInt(char);
    }
    return {card:x,value1:value1,value2:value2};
}

function removePlayerFromTable(playerId){
    var tableIndex =findPlayerTable(playerId);

    if(tableIndex!=null){
        var elementPos = tables[tableIndex].players.map(function(x) {return x.playerId; }).indexOf(playerId);

        tables[tableIndex].players.splice(elementPos,1);
        tables[tableIndex].numberOfPlayer = tables[tableIndex].numberOfPlayer-1;

    }
};
function updateTotal(table){
    for(var i=0; i<table.players.length;i++){
        var total1=0;
        var total2=0;
        for(var j= 0;j<table.players[i].cards.length;j++){
            total1 = total1 + table.players[i].cards[j].value1;
            total2 = total2 + table.players[i].cards[j].value2;
        }
        table.players[i].total1= total1;
        table.players[i].total2 = total2;

    }
    var dealerTotal1=0;
    var dealerTotal2=0;
    for(var k =0; k<table.dealer.openCards.length;k++){
        dealerTotal1=dealerTotal2+table.dealer.openCards[k].value1;
        dealerTotal2=dealerTotal2+table.dealer.openCards[k].value2;
    }
    table.dealer.total1=dealerTotal1;
    table.dealer.total2=dealerTotal2;
}
function checkPlayerTotal(player){

    var total;
    if(player.total1>=player.total2){
        //total1 > total2
        if(player.total1>21){
            //total1 > 21
            if(player.total2!=null){
                //total2 ! = null  

                total=player.total2;
            }else{
                // total2 === null
                total = player.total1;
            }
        }else{
            // total 1 > total 2 and <21
            total = player.total1;
        }

    }else{
        // total2 > total1
        if(player.total2>21){
            // total 2 > 21 
            total = player.total1;
        }else{
            total = player.total2;
        }
    }
    return total;


}
function checkPlayersTotal(table){
    for(var i=0;i<table.players.length;i++){
        var total = checkPlayerTotal(table.players[i]);

        if(total>21){
            table.players[i].status = "lose";
            table.players[i].playerBet = 0;
            freeOtherPlayer(findTableIndex(table.tableName));
        }
    }
}
function checkDealerTotal(table){
    var total=0;
    if(table.dealer.total1>=table.dealer.total2){
        //total1 > total2
        if(table.dealer.total1>21){
            //total1 > 21
            if(table.dealer.total2!=null){
                //total2 ! = null  
                total=table.dealer.total2;
            }else{
                // total2 === null
                total = table.dealer.total1;
            }
        }else{
            // total 1 > total 2 and <21
            total = table.dealer.total1;
        }

    }else{
        // total2 > total1
        if(table.dealer.total2>21){
            // total 2 > 21 
            total = table.dealer.total1;
        }else{
            total = table.dealer.total2;
        }
    }
    return total;
}
function checkFinalTotal(table){
    checkPlayersTotal(table);
    var dTotal = checkDealerTotal(table);

    if(dTotal > 21){
        for(var i =0; i <table.players.length;i++){

            if(table.players[i].status==="stand") {
                table.players[i].status="win";
                table.players[i].playerMoney = table.players[i].playerMoney + table.players[i].playerBet +  table.players[i].playerBet;
                table.players[i].playerBet = 0;
            }
        }
    }else{
        for(var i=0;i<table.players.length;i++){
            var total=checkPlayerTotal(table.players[i]);

            if(total<dTotal){

                table.players[i].status = "lose";
                table.players[i].playerBet = 0;

            }
        }
    }
}
function startNewGame(table){
console.log("startNewGame called");
    table.dealer.openCards=[];
    table.dealer.blindedCard=[];
    for(var j=0; j<table.players.length;j++){
        table.players[j].cards = [];
        table.players[j].status = "waiting";

    }
    updateTotal(table);
    if(table.stackIndex>80){
        console.log("new Stack");
        var stack = new stackModel.Stack();
        stack.makeDeck(2);
        stack.shuffle(5);
        table.stack=stack;
        table.stackIndex=0;
    }
    var tableIndex = findTableIndex(table.tableName);
    sendUpdateToAllPlayer(tableIndex);


}
function deal(player,table){

    if(player.status==="deal"){

    }else{
        if(table.dealer.openCards.length>0){
            startNewGame(table);
        }



        player.status="deal";
        player.cards.push(getCardJSON(table.stack.cards[table.stackIndex]));
        table.stackIndex=table.stackIndex+1;
    }
    var temp=1;


    //check if all players has atlease 1 card
    for(var i =0 ; i<table.players.length;i++){
        if(table.players[i].status!="standBy"){
            if(table.players[i].cards.length<1){

                temp=0; 
                break;
            }
        }
    }

    //All player has atlease one card
    if(temp===1){

        //if dealer has no card give dealer a first card

        if(table.dealer.openCards.length<1){

            table.dealer.openCards.push(getCardJSON(table.stack.cards[table.stackIndex]));
            table.stackIndex=table.stackIndex+1;

            //give all player a second card

            for(var j=0;j<table.players.length;j++){
                if(table.players[j].status!="standBy"){
                    table.players[j].cards.push(getCardJSON(table.stack.cards[table.stackIndex]));
                    table.stackIndex=table.stackIndex+1;}
            }
            //give dealer a second card

            table.dealer.blindedCard.push(getCardJSON(table.stack.cards[table.stackIndex]));
            table.stackIndex=table.stackIndex+1;



        }

    }
    //Some player yet has no card
    else{
        //wait for all player to select deal

    }
    updateTotal(table);

}

function hit(player,table){

    player.status="hit";
    var tableIndex = findPlayerTable(player.playerId);
    player.cards.push(getCardJSON(table.stack.cards[table.stackIndex]));
    table.stackIndex=table.stackIndex+1;

    updateTotal(table);

    var dTotal =  checkFinalTotal(table);
    sendUpdateToAllPlayer(tableIndex);

    temp =1;
    for(var l=0; l<table.players.length;l++){
        if(table.players[l].status!="win" && table.players[l].status!="lose" && table.players[l].status!="standBy"){

            temp=0;
            break;
        }
    }
    if(temp===0){

    }else{
        //  startNewGame(table);

    }

}

function stand(player,table){


    player.status="stand";
    var tableIndex = findPlayerTable(player.playerId);
    temp=1;
    for(var i =0 ;i < table.players.length;i++){
        if(table.players[i].status==="hit" || table.players[i].status==="deal"){
            temp=0;
            break;
        }   
    }

    if(temp===0){
        //One player has hit or deal.
        //Wait for other players to select stand
    }else{
        //All players have selected stand
        //Open dealers card.

        if(table.dealer.blindedCard.length>0){

            table.dealer.openCards.push(table.dealer.blindedCard[0]);
            table.dealer.blindedCard.splice(0,1);

            var checkPoint = true;
            while(checkPoint){

                updateTotal(table);
                checkFinalTotal(table);
                sendUpdateToAllPlayer(tableIndex);
                var temp1=1;
                for(var j =0 ; j<table.players.length;j++){
                    if(table.players[j].status==="stand"){
                        temp1=0;
                        break;
                    }
                }


                if(temp1===0){

                    //Some player is still standing
                    if(checkDealerTotal(table)<17){
                        table.dealer.openCards.push(getCardJSON(table.stack.cards[table.stackIndex]));
                        table.stackIndex=table.stackIndex+1;
                    }
                    else{
                        for(var k=0;k< table.players.length;k++){

                            if(table.players[k].status==="stand"){
                                if(checkPlayerTotal(table.players[k])>checkDealerTotal(table)){
                                    table.players[k].status="win";
                                    table.players[k].playerMoney = table.players[k].playerMoney + table.players[k].playerBet + table.players[k].playerBet;
                                    table.players[k].playerBet = 0;
                                }
                                else{
                                    table.players[k].status="lose";
                                    table.players[k].playerBet = 0;


                                }
                            }
                        }
                    }

                }
                else{
                    checkPoint=false;
                }
            }

        }
        temp =1;
        for(var l=0; l<table.players.length;l++){
            if(table.players[l].status!="win" && table.players[l].status!="lose" && table.players[l].status!="standBy"){

                temp=0;
                break;
            }
        }
        if(temp===0){

        }else{
            sendUpdateToAllPlayer(tableIndex);

        }



    }

}

function freeOtherPlayer(tableIndex){
    var table = tables[tableIndex];
    if(table!=undefined){
        for(var i =0; i<table.players.length;i++){
            if(table.players[i].status==="stand"){
                if(table.players[i]!=undefined){
                    stand(table.players[i],table);}
            }
        }
    }
}

function getPlayerMoney(Id){
    var deferred = Q.defer();
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            console.log("Problem connecting database");

        } else {

            var collection = db.collection("user",{capped:true,size:100000});
            var user;
            var playerId = parseInt(Id);

            collection.find({playerId: playerId}).toArray(function(err,items){
                if(err){
                    console.log(err);
                    deferred.reject(new Error(err));

                }else{
                    if(items.length>0){

                        deferred.resolve(items[0].playerMoney);
                    }
                    else{

                        deferred.resolve(500);
                    }
                }
            });


        }
    });
    return deferred.promise;
}
function updatePlayerMoney(Id,playerMoney){
    var deferred = Q.defer();
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            
        } else {

            var collection = db.collection("user",{capped:true,size:100000});

            var playerId = parseInt(Id);

            collection.update({playerId: playerId},{$set:{playerMoney:playerMoney}},function(err,items){
                if(err){
                    console.log(err);
                    deferred.resolve(0);
                }
                else{
                   
                    deferred.resolve(1);
                }
            });
           
        }
    });
    return deferred.promise;
}

io.on("connection",function(sct){
   
    var playerId;
    sct.on("disconnect",function(data){

        console.log("disconnecting"+playerId);
        var tableIndex = findPlayerTable(playerId);
        removePlayerFromTable(playerId);

        delete sockets[playerId];
        delete playerSocket[sct];
        freeOtherPlayer(tableIndex);
        sendUpdateToAllPlayer(tableIndex);
        removeEmptyTable();



    });
    sct.on("deal",function(data){

        playerId=data.playerId;
        var tableIndex = findPlayerTable(playerId);

        var player = findPlayer(playerId);
        //  player.status="startNew";
        player.playerBet = data.bet;
        player.playerMoney= player.playerMoney-player.playerBet;
        // startNewGame(tables[tableIndex]);
        deal(player,tables[tableIndex]);
        //   var liveTable = getLiveTable(playerId,tableIndex);
        sendUpdateToAllPlayer(tableIndex);

    });
    sct.on("hit",function(data){
        playerId=data;
        var tableIndex = findPlayerTable(playerId);
        var player = findPlayer(playerId);

        hit(player,tables[tableIndex]);
        // var liveTable = getLiveTable(playerId,tableIndex);
        // sendUpdateToAllPlayer(tableIndex);
        (updatePlayerMoney(playerId,player.playerMoney)).then(function(value){
           
        });

    });
    sct.on("stand",function(data){
        playerId=data;
        var tableIndex=findPlayerTable(playerId);
        var player = findPlayer(playerId);
        stand(player,tables[tableIndex]);
        (updatePlayerMoney(playerId,player.playerMoney)).then(function(value){
           
        });
    });
    sct.on("startNew",function(data){
        playerId = data.playerId;
        var tableIndex=findPlayerTable(playerId);
        var player = findPlayer(playerId);
        player.status="startNew";
        player.playerBet= data.bet;
        startNewGame(tables[tableIndex]);
    });
    sct.on("AddMe",function(data){
        var player;
        playerId=data.playerId;
        var table =findPlayerTable(data.playerId);
       
        if(table===null){
           
            table= game.findTableForMe(tables);
            player = JSON.parse(JSON.stringify(data));
           
            (getPlayerMoney(player.playerId)).then(function(money){
                player.playerMoney=money;
               
                player.cards =[];
                if(table.dealer.openCards.length>0){
                    var temp=0;
                    for(var i =0;i<table.players.length;i++){
                        if(table.players[i].status==="deal" || table.players[i].status==="stand" || table.players[i].status==="waiting" || table.players[i].status==="hit" ){
                            temp=1;
                            break;
                        }
                    }
                    if(temp=0 || player.status===undefined){
                       
                        player.status="waiting";
                        startNewGame(table);
                    }else{
                      
                       
                        player.status="standBy";
                    }
                }else{
                    player.status="waiting";
                }

                player.total1 =0;
                player.total2 = 0;
                player.playerBet = 0;
                sockets[player.playerId]=sct;
                playerSocket[sct]=player.playerId;
                game.addMeToTable(player,table);
                var tableIndex = findPlayerTable(player.playerId);

                sendUpdateToAllPlayer(tableIndex);
            });



        }
        else{

           
            player = findPlayer(data.playerId);
            var tableIndex = findPlayerTable(player.playerId);

            sendUpdateToAllPlayer(tableIndex);

        }
        


       

    });
    sct.on("standBy",function(data){
        playerId=data.playerId;
        var tableIndex = findPlayerTable(playerId);
        var player = findPlayer(playerId);
        var table=tables[tableIndex];

        player.status="standBy";
        for(var i=0; i<table.players.length;i++){
            
            if(table.players[i].playerId!=player.playerId){
                if(table.players[i].status==="stand"){
                  
                    stand(table.players[i],table);
                    // sendUpdateToAllPlayer(tableIndex);
                }
            }
        }


        sendUpdateToAllPlayer(tableIndex);
        temp =0;

        for(var l=0; l<table.players.length;l++){
            if(table.players[l].status==="deal"){
                temp=1;
                deal(table.players[l],tables[tableIndex]);
                sendUpdateToAllPlayer(tableIndex);

            }
        }
        if(temp===0){
            //All players are on standBy win or lose

            startNewGame(table);
        }else{

            // startNewGame(table);

        }

    });
    /*   
sct.on("error",function(err){
   console.log(err); 
});*/

});


