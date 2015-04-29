
var app = angular.module("blackjack",[]);
//app.config(function ($socketProvider) {
 //               $socketProvider.setConnectionUrl('http://localhost:3000');
 //           });
var game = app.controller("game",function($scope){
    
    $scope.table= {"tableName":"i925l0ew","player":{"playerId":1430276316308,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HJ","value1":10,"value2":10},{"card":"CQ","value1":10,"value2":10}],"status":"deal","total1":20,"total2":20},"otherPlayer":[{"playerId":1430276305397,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HK","value1":10,"value2":10},{"card":"D3","value1":3,"value2":3}],"status":"deal","total1":13,"total2":13}],"dealer":{"openCards":[{"card":"H7","value1":7,"value2":7}],"blindedCard":[{"card":"D8","value1":8,"value2":8}],"total1":7,"total2":7}};
    
    
    $scope.cardCss = function(last){
        
        if(last===true){
            return "a"
        }else{
        return "a-half";
        }
    };
    
});

