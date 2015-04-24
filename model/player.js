exports.player = function(){
    this.playerId;
    this.playerName;
    this.totalMoney;
    
}

exports.newPlayer = function(id,name,money){
    return {playerId:id,playerName:name,playerMoney:money};
}

