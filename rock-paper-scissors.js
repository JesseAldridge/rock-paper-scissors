Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Template.body.helpers({
    players: function () {
      return Players.find({});
    }
  });

  Template.player.helpers({
    is_me: function() {
      return this.name == 'player1';
    }
  });

  Template.player.events({
    'click .rock': function(event) {
      Players.update(this._id, { $set: {choice: 'rock'} });
    },

    'click .paper': function() {
      Players.update(this._id, { $set: {choice: 'paper'} });
    },

    'click .scissors': function() {
      Players.update(this._id, { $set: {choice: 'scissors'} });
    }
  });
}

if (Meteor.isServer) {
  var players = {};

  var process_choices = function(player_a, player_b) {
    console.log('process_choices:', player_a.choice, player_b.choice);
    var result = {
      rock: {rock: 0, paper: -1, scissors: 1},
      paper: {rock: 1, paper: 0, scissors: -1},
      scissors: {rock: -1, paper: 1, scissors: 0}
    }[player_a.choice][player_b.choice];

    if(result == 1)
      player_a.score += 1;
    else if(result == -1)
      player_b.score += 1;

    Players.update({name:player_a.name}, {$set: {score: player_a.score, choice: null}});
    Players.update({name:player_b.name}, {$set: {score: player_b.score, choice: null}});
  };

  var check_both_choices = function() {
    console.log('check_both_choices, players:', Object.keys(players).length);
    if(Object.keys(players).length == 2 &&
       ['rock', 'paper', 'scissors'].indexOf(players.player1.choice) != -1 &&
       ['rock', 'paper', 'scissors'].indexOf(players.player2.choice) != -1)
      process_choices(players.player1, players.player2);
  };

  Players.find({}).observe({
    added: function(player) {
      console.log('added:', player);
      players[player.name] = player;
      check_both_choices();
    },
    removed: function(player) {
      console.log('removed:', player);
      delete players[player.name];
    },
    changed: function(player, old_player) {
      console.log('changed:', player);
      delete players[old_player.name];
      players[player.name] = player;
      check_both_choices();
    }
  });
}
