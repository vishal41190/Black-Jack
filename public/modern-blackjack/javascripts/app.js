
var app = angular.module("blackjack",[ 'socket.io' ]);
var playerId = Date.now();
app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://10.42.0.1:3000');
});
var game = app.controller("game",function($scope,$socket){

    // $scope.table= {"tableName":"i925l0ew","player":{"playerId":1430276316308,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HJ","value1":10,"value2":10},{"card":"CQ","value1":10,"value2":10}],"status":"deal","total1":20,"total2":20},"otherPlayer":[{"playerId":1430276305397,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HK","value1":10,"value2":10},{"card":"D3","value1":3,"value2":3}],"status":"deal","total1":13,"total2":13}],"dealer":{"openCards":[{"card":"H7","value1":7,"value2":7}],"blindedCard":[{"card":"D8","value1":8,"value2":8}],"total1":7,"total2":7}};
    window.onbeforeunload = function(){
        
      $socket.disconnect();  
        return "You are leaving";
    };

    $scope.cardCss = function(last){

        if(last===true){    
            return "a";
        }else{
            return "a-half";
        }
    };

    $scope.playerstatus = function(status){
        if(status==="win" || status==="lose"){
            return true;
        }
        else{
            return false;
        }
    };
    
    
    
    angular.element(document).ready(function () {
        $socket.emit("AddMe",{ "playerId" : playerId, "playerName" : playerId, "playerMoney" : 500, "_id" : "55397f6f4632e8ff4f2a7c87" });

        $socket.on('update', function (data) {
            console.log(data);
            $scope.table = data;
        });
        
        $scope.bet= function(amount){
            if($scope.table.player.status==="lose" || $scope.table.player.status==="win"){
               // $socket.emit("startNew",{playerId:playerId,bet:amount});
                $scope.table.player.status="startNew";
            }
            $scope.table.player.playerMoney = $scope.table.player.playerMoney -amount;
            $scope.table.player.playerBet = $scope.table.player.playerBet + amount;
            console.log(amount);
        }

        $scope.deal = function() {
            $socket.emit('deal', {playerId:playerId,bet:$scope.table.player.playerBet});

        };
        $scope.hit = function hit(){

            $socket.emit("hit",playerId);  

        };
        $scope.stand = function stand(){
            $socket.emit("stand",playerId);
        };

    });

});