// Refered from http://www.brainjar.com/js/cards/default2.asp
exports.Stack=function() {

  // Create an empty array of cards.

  this.cards = new Array();
  this.makeDeck  = stackMakeDeck;
  this.shuffle   = stackShuffle;
  this.combine   = stackCombine;
 
};

stackMakeDeck=function(n) {

  var ranks = new Array("A", "2", "3", "4", "5", "6", "7", "8", "9",
                        "10", "J", "Q", "K");
  var suits = new Array("C", "D", "H", "S");
  var i, j, k;
  var m;

  m = ranks.length * suits.length;

  // Set array of cards.

  this.cards = new Array(n * m);

  // Fill the array with 'n' packs of cards.

  for (i = 0; i < n; i++)
    for (j = 0; j < suits.length; j++)
      for (k = 0; k < ranks.length; k++)
        this.cards[i * m + j * ranks.length + k] = suits[j]+ranks[k];
      //    new Card(ranks[k], suits[j]);
};
stackShuffle=function(n) {

  var i, j, k;
  var temp;

  // Shuffle the stack 'n' times.

  for (i = 0; i < n; i++){
    for (j = 0; j < this.cards.length; j++) {
      k = Math.floor(Math.random() * this.cards.length);
      temp = this.cards[j];
      this.cards[j] = this.cards[k];
      this.cards[k] = temp;
    }
  }
        
};


stackCombine=function(stack) {

  this.cards = this.cards.concat(stack.cards);
  stack.cards = new Array();
};