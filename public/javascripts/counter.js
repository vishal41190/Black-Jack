var timer = 10;

var interval = setInterval(function() {
    timer--;
    $('.timer').text(timer);
    if (timer === 0) clearInterval(interval);
}, 1000);