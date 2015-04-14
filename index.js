 
$(document).ready(function() {
    "use strict";
     var snd1  = new Audio();
        var src1  = document.createElement("source");
        src1.type = "audio/wav";
        src1.src  = "audio/a.wav";
        snd1.appendChild(src1);
        snd1.play();
    $("#button1").click(function() {
       

        var snd2  = new Audio();
        var src2  = document.createElement("source");
        src2.type = "audio/mp3";
        src2.src  = "audio/c.mp3";
        snd2.appendChild(src2);

         snd2.play();
    });
     $("#button2").click(function() {
       

        var snd2  = new Audio();
        var src2  = document.createElement("source");
        src2.type = "audio/mp3";
        src2.src  = "audio/d.mp3";
        snd2.appendChild(src2);

         snd2.play();
    });
    
});
