Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  // Session.setDefault('rps_choice', null);

  Template.body.helpers({
    players: function () {
      return Players.find({});
    }
  });

  Template.player.helpers({
    is_me: function() {
      // return this.name == 'player1';
      return true;
    }
  });

  Template.player.events({
    'click .rock': function(event) {
      // console.log('event:', event);
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
  Players.find({choice: {$ne: null}}).observe({
    added: function (player) {
      console.log('added player:', player);
    },
    changed: function (newSetting, oldSetting) {
      console.log('changed player:', player);
    },
    removed: function (oldSetting) {
      console.log('removed player:', player);
    }
  });
}
