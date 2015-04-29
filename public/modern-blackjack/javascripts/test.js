$(document).ready(function () {
   
    
    var socket = io("http://localhost:3000/");
    socket.on('game',function(data){
        console.log(data);
        
        
               
    });
});