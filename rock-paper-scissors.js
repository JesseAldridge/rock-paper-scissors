if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('rps_choice', null);

  Template.hello.helpers({
    rps_choice: function () {
      return Session.get('rps_choice');
    }
  });

  Template.hello.events({
    'click .rock': function() {
      Session.set('rps_choice', 'rock');
    },

    'click .paper': function() {
      Session.set('rps_choice', 'paper');
    },

    'click .scissors': function() {
      Session.set('rps_choice', 'scissors');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
