Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  // Player access helpers.

  var get_player_id = function() {
    var match = /player1|player2/.exec(window.location.href);
    return match && match[0];
  };

  var find_me = function() {
    return Players.findOne({name: get_player_id()});
  };

  var find_them = function() {
    var player_id = get_player_id();
    return (
      player_id &&
      Players.findOne({name: player_id == 'player1' ? 'player2' : 'player1'}));
  };

  Template.body.helpers({
    players: function() {
      return Players.find({});
    },
    player_id: function() {
      return get_player_id();
    },
    me: function() {
      return find_me();
    },
    them: function() {
      return find_them();
    },
    score: function(player_id) {
      var player = Players.findOne({name: player_id});
      return player && player.score;
    }
  });

  Template.body.events({
    'click div[choice]': function(event) {
      Players.update(find_me()._id, { $set: {choice: $(event.target).attr('choice')} });
    }
  });
}

if (Meteor.isServer) {
  // Initialize players.
  ['player1', 'player2'].forEach(function(name) {
    Players.update(
       { name: name },
       { name: name, choice: null, score: 0},
       { upsert: true }
    );
  });

  // See who wins.  Increment scores.  Reset after a bit.
  var process_choices = function(player_a, player_b) {
    var result = {
      rock: {rock: 0, paper: -1, scissors: 1},
      paper: {rock: 1, paper: 0, scissors: -1},
      scissors: {rock: -1, paper: 1, scissors: 0}
    }[player_a.choice][player_b.choice];

    if(result == 1)
      player_a.score += 1;
    else if(result == -1)
      player_b.score += 1;

    Meteor.setTimeout(function() {
      Players.update(
        {name:player_a.name}, {$set: {score: player_a.score, choice: null}});
      Players.update(
        {name:player_b.name}, {$set: {score: player_b.score, choice: null}});
    }, 1000);
  };

  // Wait for both players to make a choice.
  var players = {};

  var check_both_choices = function() {
    if(Object.keys(players).length == 2 &&
       ['rock', 'paper', 'scissors'].indexOf(players.player1.choice) != -1 &&
       ['rock', 'paper', 'scissors'].indexOf(players.player2.choice) != -1)
      process_choices(players.player1, players.player2);
  };

  Players.find({}).observe({
    added: function(player) {
      players[player.name] = player;
      check_both_choices();
    },
    removed: function(player) {
      delete players[player.name];
    },
    changed: function(player, old_player) {
      delete players[old_player.name];
      players[player.name] = player;
      check_both_choices();
    }
  });
}
