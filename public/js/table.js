/*

A JavaScript Blackjack game created June 2013 by Chris Clower 
(clowerweb.com). Deck class loosely based on a tutorial at:
http://www.codecademy.com/courses/blackjack-part-1

All graphics and code were designed/written by me except for the
chip box on the table, which was taken from the image at:
http://www.marketwallpapers.com/wallpapers/9/wallpaper-52946.jpg

Uses Twitter Bootstrap and jQuery, which also were not created by
me :)

Fonts used:
* "Blackjack" logo: Exmouth
* Symbol/floral graphics: Dingleberries
* All other fonts: Adobe Garamond Pro

All graphics designed in Adobe Fireworks CS6

You are free to use or modify this code for any purpose, but I ask
that you leave this comment intact. Please understand that this is
still very much a work in progress, and is not feature complete nor
without bugs.

I will also try to comment the code better for future updates :D

*/

/*global $, confirm, Game, Player, renderCard, Card, setActions, 
resetBoard, showBoard, showAlert, getWinner, jQuery, wager */

(function () {

/*****************************************************************/
/*************************** Globals *****************************/
/*****************************************************************/

  var game      = new Game(),
      player    = new Player(),
      dealer    = new Player(),
      running   = false,
      blackjack = false,
      insured   = 0,
      deal;

/*****************************************************************/
/*************************** Classes *****************************/
/*****************************************************************/

  function Player() {
    var hand  = [],
        wager = 0,
        cash  = 1000,
        bank  = 0,
        ele   = '',
        score = '';

    this.getElements = function() {
      if(this === player) {
        ele   = '#phand';
        score = '#pcard-0 .popover-content';
      } else {
        ele   = '#dhand';
        score = '#dcard-0 .popover-content';
      }

      return {'ele': ele, 'score': score};
    };

    this.getHand = function() {
      return hand;
    };

    this.setHand = function(card) {
      hand.push(card);
    };

    this.resetHand = function() {
      hand = [];
    };

    this.getWager = function() {
      return wager;
    };

    this.setWager = function(money) {
      wager += parseInt(money, 0);
    };

    this.resetWager = function() {
      wager = 0;
    };

    this.checkWager = function() {
      return wager <= cash ? true : false;
    };

    this.getCash = function() {
      return cash.formatMoney(2, '.', ',');
    };

    this.setCash = function(money) {
      cash += money;
      this.updateBoard();
    };

    this.getBank = function() {
      $('#bank').html('Winnings: $' + bank.formatMoney(2, '.', ','));

      if(bank < 0) {
        $('#bank').html('Winnings: <span style="color: #D90000">-$' + 
        bank.formatMoney(2, '.', ',').toString().replace('-', '') + '</span>');
      }
    };

    this.setBank = function(money) {
      bank += money;
      this.updateBoard();
    };

    this.flipCards = function() {
      $('.down').each(function() {
        $(this).removeClass('down').addClass('up');
        renderCard(false, false, false, $(this));
      });

      $('#dcard-0 .popover-content').html(dealer.getScore());
    };
  }

  function Deck() {
    var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
        suits = ['&#9824;', '&#9827;', '&#9829;', '&#9670;'],
        deck  = [],
        i, x, card;

    this.getDeck = function() {
      return this.setDeck();
    };

    this.setDeck = function() {
      for(i = 0; i < ranks.length; i++) {
        for(x = 0; x < suits.length; x++) {
          card = new Card({'rank': ranks[i]});

          deck.push({
            'rank' : ranks[i],
            'suit' : suits[x],
            'value': card.getValue()
          });
        }
      }

      return deck;
    };
  }

  function Shuffle(deck) {
    var set      = deck.getDeck(),
        shuffled = [],
        card;

    this.setShuffle = function() {
      while(set.length > 0) {
        card = Math.floor(Math.random() * set.length);

        shuffled.push(set[card]);
        set.splice(card, 1);
      }

      return shuffled;
    };

    this.getShuffle = function() {  
      return this.setShuffle();
    };
  }

  function Card(card) {
    this.getRank = function() {
      return card.rank;
    };

    this.getSuit = function() {
      return card.suit;
    };

    this.getValue = function() {
      var rank  = this.getRank(),
          value = 0;

      if(rank === 'A') {
        value = 11;
      } else if(rank === 'K') {
        value = 10;
      } else if(rank === 'Q') {
        value = 10;
      } else if(rank === 'J') {
        value = 10;
      } else {
        value = parseInt(rank, 0);
      }

      return value;
    };
  }

  function Deal() {
    var deck     = new Deck(),
        shuffle  = new Shuffle(deck),
        shuffled = shuffle.getShuffle(),
        card;

    this.getCard = function(sender) {
      this.setCard(sender);
      return card;
    };

    this.setCard = function(sender) {
      card = shuffled[0];
      shuffled.splice(card, 1);
      sender.setHand(card);
    };

    this.dealCard = function(num, i, obj) {
      if(i >= num) { return false; }

      var sender   = obj[i],
          elements = obj[i].getElements(),
          score    = elements.score,
          ele      = elements.ele,
          dhand    = dealer.getHand();

      deal.getCard(sender);

      if(i < 3) {
        renderCard(ele, sender, 'up');
        $(score).html(sender.getScore());
      } else {
        renderCard(ele, sender, 'down');
      }

      if(player.getHand().length < 3) {
        if(dhand.length > 0 && dhand[0].rank === 'A') {
          setActions('insurance');
        }

        if(player.getScore() === 21) {
          if(!blackjack) {
            blackjack = true;
            getWinner();
          } else {
            dealer.flipCards();
            $('#dscore span').html(dealer.getScore());
          }
        } else {
          if(dhand.length > 1) {
            setActions('run');
          }
        }
      }

      function showCards() {
        setTimeout(function() {
          deal.dealCard(num, i + 1, obj);
        }, 500);
      }

      clearTimeout(showCards());
    };
  }

  function Game() {
    this.newGame = function() {
      var wager = $.trim($('#wager').val());

      player.resetWager();
      player.setWager(wager);

      if(player.checkWager()) {
        $('#deal').prop('disabled', true);
        resetBoard();
        player.setCash(-wager);

        deal      = new Deal();
        running   = true;
        blackjack = false;
        insured   = false;

        player.resetHand();
        dealer.resetHand();
        showBoard();
      } else {
        player.setWager(-wager);
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        showAlert('Wager cannot exceed available cash!');
      }
    };
  }

/*****************************************************************/
/************************* Extensions ****************************/
/*****************************************************************/

  Player.prototype.hit = function(dbl) {
    var pscore;

    deal.dealCard(1, 0, [this]);
    pscore = player.getScore();

    if(dbl || pscore > 21) {
      running = false;

      setTimeout(function() {
        player.stand();
      }, 500);
    } else {
      this.getHand();
    }

    setActions();

    player.updateBoard();
  };

  Player.prototype.stand = function() {
    var timeout = 0;

    running = false;
    dealer.flipCards();

    function checkDScore() {
      if(dealer.getScore() < 17 && player.getScore() <= 21) {
        timeout += 200;

        setTimeout(function() {
          dealer.hit();
          checkDScore();
        }, 500);
      } else {
        setTimeout(function() {
          getWinner();
        }, timeout);
      }
    }

    checkDScore();
  };

  Player.prototype.dbl = function() {
    var wager = this.getWager();

    if(this.checkWager(wager * 2)) {
      $('#double').prop('disabled', true);
      this.setWager(wager);
      this.setCash(-wager);
      
      this.hit(true);
    } else {
      $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
      showAlert('You don\'t have enough cash to double down!');
    }
  };

  Player.prototype.split = function() {
    $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
    showAlert('Split function is not yet working.');
  };

  Player.prototype.insure = function() {
    var wager    = this.getWager() / 2,
        newWager = 0;

    $('#insurance').prop('disabled', true);
    this.setWager(wager);

    if(this.checkWager()) {
      newWager -= wager;
      this.setCash(newWager);
      insured = wager;
    } else {
      this.setWager(-wager);
      $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
      showAlert('You don\'t have enough for insurance!');
    }
  };

  Player.prototype.getScore = function() {
    var hand  = this.getHand(),
        score = 0,
        aces  = 0,
        i;

    for(i = 0; i < hand.length; i++) {
      score += hand[i].value;

      if(hand[i].value === 11) { aces += 1; }

      if(score > 21 && aces > 0) {
        score -= 10;
        aces--;
      }
    }

    return score;
  };

  Player.prototype.updateBoard = function() {
    var score = '#dcard-0 .popover-content';

    if(this === player) {
      score = '#pcard-0 .popover-content';
    }

    $(score).html(this.getScore());
    $('#cash span').html(player.getCash());
    player.getBank();
  };

  Number.prototype.formatMoney = function(c, d, t) {
    var n = this, 
        s = n < 0 ? '-' : '',
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
        j = i.length;
        j = j > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
   };

/*****************************************************************/
/************************** Functions ****************************/
/*****************************************************************/

  (function($) {
    $.fn.disableSelection = function() {
      return this.attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);
    };
  }(jQuery));

  (function($) {
    $.fn.numOnly = function() {
      this.on('keydown', function(e) {
        if(e.keyCode === 46 || e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 27 || e.keyCode === 13 || (e.keyCode === 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39)) {
          return true;
        } else {
          if(e.shifKey || ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105))) {
            e.preventDefault();
          }
        }
      });
    };
  }(jQuery));

  function showAlert(msg) {
    $('#alert span').html('<strong>' + msg + '</strong>');
    $('#alert').fadeIn();
  }

  function setActions(opts) {
    var hand = player.getHand();

    if(!running) {
      $('#deal')  .prop('disabled', false);
      $('#hit')   .prop('disabled', true);
      $('#stand') .prop('disabled', true);
      $('#double').prop('disabled', true);
      $('#split') .prop('disabled', true);
      $('#insurance').prop('disabled', true);
    }

    if(opts === 'run') {
      $('#deal')  .prop('disabled', true);
      $('#hit')   .prop('disabled', false);
      $('#stand') .prop('disabled', false);

      if(player.checkWager(wager * 2)) {
        $('#double').prop('disabled', false);
      }
    } else if(opts === 'split') {
      $('#split').prop('disabled', false);
    } else if(opts === 'insurance') {
      $('#insurance').prop('disabled', false);
    } else if(hand.length > 2) {
      $('#double')   .prop('disabled', true);
      $('#split')    .prop('disabled', true);
      $('#insurance').prop('disabled', true);
    }
  }

  function showBoard() {
    deal.dealCard(4, 0, [player, dealer, player, dealer]);
  }

  function renderCard(ele, sender, type, item) {
    var hand, i, card;

    if(!item) {
      hand = sender.getHand();
      i    = hand.length - 1;
      card = new Card(hand[i]);
    } else {
      hand = dealer.getHand();
      card = new Card(hand[1]);
    }

    var rank  = card.getRank(),
        suit  = card.getSuit(),
        color = 'red',
        posx  = 402,
        posy  = 182,
        speed = 200,
        cards = ele + ' .card-' + i;

    if(i > 0) {
      posx -= 50 * i;
    }

    if(!item) {
      $(ele).append(
        '<div class="card-' + i + ' ' + type + '">' + 
          '<span class="pos-0">' +
            '<span class="rank">&nbsp;</span>' +
            '<span class="suit">&nbsp;</span>' +
          '</span>' +
          '<span class="pos-1">' +
            '<span class="rank">&nbsp;</span>' +
            '<span class="suit">&nbsp;</span>' +
          '</span>' +
        '</div>'
      );

      if(ele === '#phand') {
        posy  = 360;
        speed = 500;
        $(ele + ' div.card-' + i).attr('id', 'pcard-' + i);

        if(hand.length < 2) {
          $('#pcard-0').popover({
            animation: false,
            container: '#pcard-0',
            content: player.getScore(),
            placement: 'left',
            title: 'You Have',
            trigger: 'manual'
          });

          setTimeout(function() {
            $('#pcard-0').popover('show');
            $('#pcard-0 .popover').css('display', 'none').fadeIn();
          }, 500);
        }
      } else {
        $(ele + ' div.card-' + i).attr('id', 'dcard-' + i);

        if(hand.length < 2) {
          $('#dcard-0').popover({
            container: '#dcard-0',
            content: dealer.getScore(),
            placement: 'left',
            title: 'Dealer Has',
            trigger: 'manual'
          });

          setTimeout(function() {
            $('#dcard-0').popover('show');
            $('#dcard-0 .popover').fadeIn();
          }, 100);
        }
      }

      $(ele + ' .card-' + i).css('z-index', i);

      $(ele + ' .card-' + i).animate({
        'top': posy,
        'right': posx
      }, speed);

      $(ele).queue(function() {
        $(this).animate({ 'left': '-=25.5px' }, 100);
        $(this).dequeue();
      });
    } else {
      cards = item;
    }

    if(type === 'up' || item) {
      if(suit !== '&#9829;' && suit !== '&#9670;') {
        color = 'black';
      }

      $(cards).find('span[class*="pos"]').addClass(color);
      $(cards).find('span.rank').html(rank);
      $(cards).find('span.suit').html(suit);
    }
  }

  function resetBoard() {
    $('#dhand').html('');
    $('#phand').html('');
    $('#result').html('');
    $('#phand, #dhand').css('left', 0);
  }

  function getWinner() {
    var phand    = player.getHand(),
        dhand    = dealer.getHand(),
        pscore   = player.getScore(),
        dscore   = dealer.getScore(),
        wager    = player.getWager(),
        winnings = 0,
        result;

    running = false;
    setActions();

    if(pscore > dscore) {
      if(pscore === 21 && phand.length < 3) {
        winnings = (wager * 2) + (wager / 2);
        player.setCash(winnings);
        player.setBank(winnings - wager);
        $('#alert').removeClass('alert-info alert-error').addClass('alert-success');
        result = 'Blackjack!';
      } else if(pscore <= 21) {
        winnings = wager * 2;
        player.setCash(winnings);
        player.setBank(winnings - wager);
        $('#alert').removeClass('alert-info alert-error').addClass('alert-success');
        result = 'You win!';
      } else if(pscore > 21) {
        winnings -= wager;
        player.setBank(winnings);
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        result = 'Bust';
      }
    } else if(pscore < dscore) {
      if(pscore <= 21 && dscore > 21) {
        winnings = wager * 2;
        player.setCash(winnings);
        player.setBank(winnings - wager);
        $('#alert').removeClass('alert-info alert-error').addClass('alert-success');
        result = 'You win - dealer bust!';
      } else if(dscore <= 21) {
        winnings -= wager;
        player.setBank(winnings);
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        result = 'You lose!';
      }
    } else if(pscore === dscore) {
      if(pscore <= 21) {
        if(dscore === 21 && dhand.length < 3 && phand.length > 2) {
          winnings -= wager;
          player.setBank(winnings);
          $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
          result = 'You lose - dealer Blackjack!';
        } else {
          winnings = wager;
          $('#alert').removeClass('alert-error alert-success').addClass('alert-info');
          player.setCash(winnings);
          result = 'Push';
        }
      } else {
        winnings -= wager;
        player.setBank(winnings);
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        result = 'Bust';
      }
    }

    showAlert(result);

    dealer.flipCards();
    dealer.updateBoard();

    if(parseInt(player.getCash()) < 1) {
      $('#myModal').modal();
      $('#newGame').on('click', function() {
        player.setCash(1000);
        $(this).unbind('click');
        $('#myModal').modal('hide');
      });
    }
  }

/*****************************************************************/
/*************************** Actions *****************************/
/*****************************************************************/

  $('#deal').on('click', function() {
    var cash = parseInt(player.getCash());

    $('#alert').fadeOut();

    if(cash > 0 && !running) {
      if($.trim($('#wager').val()) > 0) {
        game.newGame();
      } else {
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        showAlert('The minimum bet is $1.');
      }
    } else {
      $('#myModal').modal();
    }
  });

  $('#hit').on('click', function() {
    player.hit();
  });

  $('#stand').on('click', function() {
    player.stand();
  });

  $('#double').on('click', function() {
    player.dbl();
  });

  $('#split').on('click', function() {
    player.split();
  });

  $('#insurance').on('click', function() {
    player.insure();
  });

/*****************************************************************/
/*************************** Loading *****************************/
/*****************************************************************/

  $('#wager').numOnly();
  $('#actions:not(#wager), #game, #myModal').disableSelection();
  $('#newGame, #cancel').on('click', function(e) { e.preventDefault(); });
  $('#cancel').on('click', function() { $('#myModal').modal('hide'); });
  $('#wager').val(100);
  $('#cash span').html(player.getCash());
  player.getBank();

}());