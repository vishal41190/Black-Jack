
var app = angular.module("blackjack",[ 'socket.io' ]);
var playerId = document.getElementById('playerId').innerHTML;
var playerName= document.getElementById('playerName').innerHTML;
var stop;

app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:3000');
});//10.42.0.1
var game = app.controller("game",function($scope,$socket,$interval){

   
    window.onbeforeunload = function(){

        $socket.disconnect();  
        return "You are leaving";
    };
    
    $scope.temp = playerId;
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

        $scope.timer=15;
        function updateMessage(){
            if($scope.status==="standBy"){
                $scope.alertMessage="wait for next round";
            }
            if($scope.status==="win"){
                $scope.alertMessage = "Congrats, You WON. Place bet and play again";
            }
            if($scope.status==="lose"){
                $scope.alertMessage = "Sorry, You LOSE. Place bet and play again";
            }
            if($scope.status==="winLastRound"){
                $scope.alertMessage="Congrats, You WON. Place bet and play again";
            }
            if($scope.status==="loseLastRound"){
                $scope.alertMessage = "Sorry, You LOSE. Place bet and play again";
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
           
            $scope.timer--;

            if ($scope.timer === 0){ 
               
                $socket.emit("standBy",{playerId:playerId});

            }
        }




        $socket.emit("AddMe",{ "playerId" : playerId, "playerName" : playerName});

        $socket.on('update', function (data) {

          
            $scope.table = data;
            console.log($scope.table);
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
                    $scope.timer = 15;
                }
                else if($scope.status==="lose"){

                    $scope.status="loseLastRound";
                    $scope.timer = 15;
                }
                else if($scope.status==="standBy"){
                    $scope.status="waiting";
                    $scope.timer =15;
                }

                else{
                    if($scope.status==="waiting"){

                    }else if($scope.status==="starting"){
                        $scope.status = "waiting";
                        $scope.startTimer = $interval($scope.timerFunction,1000);
                    }else{
                        $scope.status ="waiting";
                        $scope.timer = 15;

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
                        $scope.timer=15;
                    }

                }
                else{
                    if($scope.status!="deal"){
                        if($scope.table.player.total1===21 || $scope.table.player.total2===21){
                            console.log("you got black jack");
                        }
                        $scope.status = "deal";
                        updateMessage();
                        $scope.timer=15;
                    }


                }
            }
            if($scope.table.player.status==="hit"){
                if($scope.status==="hit"){

                }else{
                    $scope.status="hit";
                    $scope.timer=15;

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
           
            if($scope.table.player.status==="win" || $scope.table.player.status === "lose"){

                var temp=1;
                for(var i =0; i<$scope.table.otherPlayer.length;i++){
                    if($scope.table.otherPlayer[i].status==="deal" || $scope.table.otherPlayer[i].status==="hit" ||$scope.table.otherPlayer[i].status==="stand"){
                      
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
            if($scope.table.player.playerMoney>=amount){
            $scope.table.player.playerMoney = $scope.table.player.playerMoney -amount;
            $scope.table.player.playerBet = $scope.table.player.playerBet + amount;
            }else{
                $scope.alertMessage= "You don't have enough to bet more";
            }
           
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
            $scope.timer=15;

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