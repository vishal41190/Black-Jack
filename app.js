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

function removeSocketData(plyr){
    delete plyr.socket;
}

function getLiveTable(playerId,tableIndex){

    var temp = {};
    
    var tbl = JSON.parse(JSON.stringify(tables[tableIndex]));
  //  console.log(tbl.players);
    temp.tableName=tbl.tableName;
    temp.player = getPlayer(tbl.players,playerId);
    temp.otherPlayer = getOtherPlayer(tbl.players,playerId);
    temp.dealer = tbl.dealer;
    delete temp.player.socket;
    for(var i =0; i<temp.otherPlayer.length;i++){
       delete temp.otherPlayer[i].socket;
    }
    //console.log(temp);
    return temp;

}

function findPlayer(playerId){
    
    for(var i =0; i<tables.length ;i++){
       var elementPos = tables[i].players.map(function(x) {return x.playerId; }).indexOf(playerId);
        if(elementPos>=0){
        return elementPos;
        }
    }
}


var tables=[];
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
io.on("connection",function(sct){
    console.log("connected");

    sct.on("AddMe",function(data){
        
        table= game.findTableForMe(JSON.stringify(tables));
        var player = JSON.parse(JSON.stringify(data));
        player.cards =[];
        player.status="waiting";
        player.total =0;
        player.socket=sct;
       game.addMeToTable(player,table);
        
        var liveTable=getLiveTable(player.playerId,findPlayer(player.playerId));
        console.log(tables[0].players[0]);
        tables[0].players[0].socket.emit("added",liveTable);
        //io.socket(sct.id).emit("added",liveTable);
        //sct.emit("added",liveTable);
       
        
        
        
        
        
    });
sct.on("error",function(err){
   console.log(err); 
});

});


