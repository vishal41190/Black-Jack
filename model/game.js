
exports.table=function(){
    this.tableId;
    this.players=[];
    this.findTableForMe = findTableForMe;
    this.newGame = newGame;
    this.hit = hit;
    this.stand= stand;
    this.deal =deal;
}

newTable = function(){
    this.tableId = "abc";
}
findTableForMe = function(player){
    
}
addMeToTable = function(player){
    this.players.push(player);
}

hit = function(player){
    
}

stand = function(player){
    
}

deal = function(player){
    
}