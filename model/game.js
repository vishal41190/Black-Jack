
var stackModel = require('../model/stack');


var tables=[];

//Connect to database and get collection


function generateTableName() {
    var temp = Date.now();
    return (temp.toString(36));

}






function createNewTable(){
  
    var stack = new stackModel.Stack();
    stack.makeDeck(2);
    stack.shuffle(5);
   // console.log(stack);   
    var table = {
        tableName: generateTableName(),
        players:[],
        numberOfPlayer: 0,
        dealer : {openCards:[],blindedCard:[],total1:0,total2:0},
        stack: stack,
        stackIndex:0
    };

    
    return table;
}

exports.addMeToTable=function(player,table){

    table.players.push(player);
    table.numberOfPlayer=table.numberOfPlayer+1;
    
    return table;
};


function getPlayer(playerId){

}

exports.findTableForMe=function(tables){
    
    var temp = tables.filter(function(item){
        return item.numberOfPlayer < 3;
    });

    if(temp.length===0){
        temp = createNewTable();
        var tableName;
        if(tables.length<1){
            tableName =0;
        }else
            {
                tableName =parseInt(tables[tables.length-1].tableName)+1;
            }
        // tableName = parseInt(tables[tables.length-1].tableName)
        temp.tableName=tableName;
        tables.push(temp);
        return temp;
    }else{
        return temp[0];
    }
};

