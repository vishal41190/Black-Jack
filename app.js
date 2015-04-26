var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var socketIo = require("socket.io");

var routes = require('./routes/index');
var users = require('./routes/users');
var game = require('./model/game');
var test = require('./routes/test');
var databaseUrl = "mongodb://localhost:27017/blackjack";
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

app.use('/', routes);
app.use('/users', users);

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
        items.playerId!= plId;
    });
    return temp;
}



function getLiveTable(playerId,tableIndex){

    var temp = {};

    var tbl = tables[tableIndex];
    //  console.log(tbl.players);
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



var table = {

    tableName: "",
    players:[],
    numberOfPlayer: 0,
    dealer : null,
    stack: [],
    stackIndex:0


};
var liveTable={
    tableName:"afsf",
    otherPlayer:[],
    player:{ cards:[], status:"", total:3},
    dealer:{opencards:[],blindedCard:"",total:10}
};

function sendUpdateToAllPlayer(liveTbl,table){
    // console.log(table);
    var players = table.players;
    for(var i =0 ;i < players.length ; i++){
        sockets[players[i].playerId].emit("update",liveTbl);

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

    var table = tables.filter(function(table){

        return table.players.filter(function(player){

            return player.playerId==playerId;
        });
    });

    if(table.length<1){
        return null;
    }
    else{
        var elementPos = tables.map(function(x) {return x.tableName; }).indexOf(table[0].tableName);

        return elementPos;
    }
}

function removeEmptyTable(){
    for(var i =0; i<tables.length;i++){
        console.log("numberOfPlayer");
        console.log(tables[i].numberOfPlayer);
        if(tables[i].numberOfPlayer===0){
            tables.splice(i,1);
            console.log("Empty table removed");
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
        value2=null;
    }
    else if(char === "1"){
        value1=10;
    }
    else{
        value1=parseInt(char);
        value2=null;
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
    for(var k =0; k<table.dealer.opencards.length;k++){
        dealerTotal1=dealerTotal2+table.dealer.opencards[k].value1;
        dealerTotal2=dealerTotal2+table.dealer.opencards[k].value2;
    }
    table.dealer.total1=dealerTotal1;
    table.dealer.total2=dealerTotal2;
}
function deal(player,table){

    player.cards.push(getCardJSON(table.stack.cards[table.stackIndex]));
    table.stackIndex=table.stackIndex+1;
    var temp=1;
    //check if all players has atlease 1 card
    for(var i =0 ; i<table.players.length;i++){
        if(table.players[i].cards.length<0){
            temp=0;   
        }
    }

    //All player has atlease one card
    if(temp===1){

        //if dealer has no card give dealer a first card

        if(table.dealer.opencards.length<1){

            table.dealer.opencards.push(getCardJSON(table.stack.cards[table.stackIndex]));
            table.stackIndex=table.stackIndex+1;

            //give all player a second card

            for(var j=0;j<table.players.length;j++){
                table.players[j].cards.push(getCardJSON(table.stack.cards[table.stackIndex]));
                table.stackIndex=table.stackIndex+1;
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

io.on("connection",function(sct){
    console.log("connected");

    sct.on("disconnect",function(){
        var playerId = playerSocket[sct];
        console.log("disconnecting");
        removePlayerFromTable(playerId);
        delete sockets[playerId];
        delete playerSocket[sct];
        removeEmptyTable();

    });
    sct.on("AddMe",function(data){
        var player;
        var table =findPlayerTable(data.playerId);

        if(table===null){
            table= game.findTableForMe(tables);
            player = JSON.parse(JSON.stringify(data));
            player.cards =[];
            player.status="waiting";
            player.total1 =0;
            player.total2 = 0;
            sockets[player.playerId]=sct;
            playerSocket[sct]=player.playerId;
            game.addMeToTable(player,table);

        }
        else{
            player = findPlayer(data.playerId);

        }
        var liveTable=getLiveTable(player.playerId,findTableIndex(table.tableName));
        // console.log(tables[0].players[0]);
        var tableIndex = findPlayerTable(player.playerId);

        sendUpdateToAllPlayer(liveTable,tables[tableIndex]);
        //io.socket(sct.id).emit("added",liveTable);
        //sct.emit("added",liveTable);  
        sct.on("deal",function(data){
            var playerId=data;
            var tableIndex = findPlayerTable(playerId);

            var player = findPlayer(playerId);

            deal(player,tables[tableIndex]);
            var liveTable = getLiveTable(playerId,tableIndex);
            sendUpdateToAllPlayer(liveTable,tables[tableIndex]);

        });
        
        
        sct.on("deal",function(data){
            var playerId=data;
            
            
        });



    });

    /*
sct.on("error",function(err){
   console.log(err); 
});*/

});


