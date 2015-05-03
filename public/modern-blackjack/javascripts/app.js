
var app = angular.module("blackjack",[ 'socket.io' ]);
var playerId = Date.now();
var stop;

app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://10.42.0.1:3000');
});
var game = app.controller("game",function($scope,$socket,$interval){

    // $scope.table= {"tableName":"i925l0ew","player":{"playerId":1430276316308,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HJ","value1":10,"value2":10},{"card":"CQ","value1":10,"value2":10}],"status":"deal","total1":20,"total2":20},"otherPlayer":[{"playerId":1430276305397,"playerName":"vishal","playerMoney":500,"_id":"55397f6f4632e8ff4f2a7c87","cards":[{"card":"HK","value1":10,"value2":10},{"card":"D3","value1":3,"value2":3}],"status":"deal","total1":13,"total2":13}],"dealer":{"openCards":[{"card":"H7","value1":7,"value2":7}],"blindedCard":[{"card":"D8","value1":8,"value2":8}],"total1":7,"total2":7}};
    window.onbeforeunload = function(){

        $socket.disconnect();  
        return "You are leaving";
    };


    angular.element(document).ready(function () {
        $scope.status="starting";
        $scope.cardCss = function(last){

            if(last===true){    
                return "a";
            }else{
                return "a-half";
            }
        };
        $scope.showTotal2=function(total1,total2){
            if(total1 === total2){
                return false;
            }else{
                return true;
            }
        };
        $scope.messsageCss=function(status){
           
          if(status==="win"){
              return "alert-success";
          }  
            else if(status==="lose"){
                return "alert-danger";
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
        $scope.showTimer = function(){
            if($scope.timer>0){
                return true;
            }
            else{
                return false;
            }
        }

        $scope.timer=20;
        function updateMessage(){
            if($scope.status==="standBy"){
                $scope.alertMessage="wait for next round";
            }
            if($scope.status==="win"){
                $scope.alertMessage = "Congrates You WON. Place bet and play again";
            }
            if($scope.status==="lose"){
                $scope.alertMessage = "Sorry You LOSE. Place bet and play again";
            }
            if($scope.status==="winLastRound"){
                $scope.alertMessage="Congrates You WON. Place bet and play again";
            }
            if($scope.status==="loseLastRound"){
                $scope.alertMessage = "Sorry You LOSE. Place bet and play again";
            }
            if($scope.status==="waiting"){
                $scope.alertMessage="Place bet and select Deal";
            }
            if($scope.status === "waitingForOther"){
                $scope.alertMessage="Waiting for other players";
            }
            if($scope.status === "deal"){
                $scope.alertMessage = "Select Hit Or Stand";
            }
        }


        $scope.timerFunction=function(){
            console.log("timer running ");
            $scope.timer--;

            if ($scope.timer === 0){ 
                console.log("time to zero");
                $socket.emit("standBy",{playerId:playerId});

            }
        }




        $socket.emit("AddMe",{ "playerId" : playerId, "playerName" : playerId, "playerMoney" : 500});

        $socket.on('update', function (data) {

            console.log(data);
            $scope.table = data;

            if($scope.table.player.status==="win"){
                                $scope.status="win";
                $scope.timer = -1;
                updateMessage();
            }
            if($scope.table.player.status==="lose"){
                $scope.status="lose";
                $scope.timer = -1;
                updateMessage();

            }
            if($scope.table.player.status==="standBy"){
                $scope.status="standBy";
                updateMessage();
            }
            if($scope.table.player.status==="waiting"){
                if($scope.status==="win"){
                    $scope.status="winLastRound";
                    $scope.timer = 20;
                }
                else if($scope.status==="lose"){

                    $scope.status="loseLastRound";
                    $scope.timer = 20;
                }
                else if($scope.status==="standBy"){
                    $scope.status="waiting";
                    $scope.timer =20;
                }

                else{
                    if($scope.status==="waiting"){

                    }else if($scope.status==="starting"){
                        $scope.status = "waiting";
                        $scope.startTimer = $interval($scope.timerFunction,1000);
                    }else{
                        $scope.status ="waiting";
                        $scope.timer = 20;

                    }

                }

                updateMessage();
            }
            if($scope.table.player.status==="deal"){

               
                if($scope.table.dealer.openCards.length<1){
                     var temp=0;
                for(var i=0;i<$scope.table.otherPlayers;i++){
                    if($scope.table.otherPlayer[i].status==="standBy"){
                       temp=1;
                    }
                }
                    if(temp===0){
                    $scope.status = "waitingForOther";
                    updateMessage();
                    $scope.timer = -1;
                    }
                    else{
                        $scope.status ="deal";
                        updateMessage();
                        $scope.timer=20;
                    }

                }
                else{
                    if($scope.status!="deal"){
                        $scope.status = "deal";
                        updateMessage();
                        $scope.timer=20;
                    }
                    

                }
            }
            if($scope.table.player.status==="hit"){
                if($scope.status==="hit"){

                }else{
                    $scope.status="hit";
                    $scope.timer=20;

                }
            }
            if($scope.table.player.status==="stand"){
                if($scope.status==="stand"){
                    $scope.status==="waitingForOther";
                    
                }else{
                    $scope.status="stand";
                    $scope.timer = -1;
                }
                updateMessage();
            }
            console.log($scope.table.player.status);
            console.log($scope.status);
            if($scope.table.player.status==="win" || $scope.table.player.status === "lose"){
                
                var temp=1;
                for(var i =0; i<$scope.table.otherPlayer.length;i++){
                    if($scope.table.otherPlayer[i].status==="deal" || $scope.table.otherPlayer[i].status==="hit" ||$scope.table.otherPlayer[i].status==="stand"){
                        console.log("i am here");
                        console.log($scope.table.otherPlayer[i].status);
                        temp=0;
                        break;
                    }
                }
                if(temp===0){   
                    $scope.status="waitingForOther";
                }
                updateMessage();
            }
            if($scope.status==="waitingForOther"){
                var temp=1;
                for(var i=0;i<$scope.table.otherPlayers.length;i++){
                    if($scope.table.otherPlayers[i].status==="standBy"){
                        
                    }
                }
            }
        });

        $scope.bet= function(amount){
            if($scope.table.player.status==="lose" || $scope.table.player.status==="win"){
                // $socket.emit("startNew",{playerId:playerId,bet:amount});
                //  $scope.table.player.status="startNew";
            }
            $scope.table.player.playerMoney = $scope.table.player.playerMoney -amount;
            $scope.table.player.playerBet = $scope.table.player.playerBet + amount;
            console.log(amount);
        }

        $scope.deal = function() {
            if($scope.table.player.playerBet>0){
            $socket.emit('deal', {playerId:playerId,bet:$scope.table.player.playerBet});
            }
            else{
                $scope.alertMessage="Place minimum bet of $1";
            }

        };
        $scope.hit = function hit(){

            $socket.emit("hit",playerId); 
            $scope.timer=20;

        };
        $scope.stand = function stand(){
            $socket.emit("stand",playerId);
            $scope.status="waitingForOther";
            $scope.timer=-1;
            updateMessage();
        };



    });

});

//Notes to do

//set minimum bet. 
//Change the way total1 and total2 display.