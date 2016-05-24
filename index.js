var AlexaSkill = require('./AlexaSkill');

var APP_ID = 'amzn1.echo-sdk-ams.app.ba9decb5-a3f8-48bd-9d9b-27b2bd9acaa4'; //undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var SNACK_LIST = [{
  snack_name: "Kitkat",
  ranking: 9,
  friend_name: "Max"
}, {
  snack_name: "Banana",
  ranking: "2",
  friend_name: "Joe"
}, {
  snack_name: "Tutsi Roll",
  ranking: "4",
  friend_name: "Himanshu"
}, {
  snack_name: "Poptart",
  ranking: "5",
  friend_name: "Bob"
}];


/**
 * SnackMeSkill is a child of AlexaSkill.
 */
var SnackMeSkill = function() {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SnackMeSkill.prototype = Object.create(AlexaSkill.prototype);
SnackMeSkill.prototype.constructor = SnackMeSkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
SnackMeSkill.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);

  // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
SnackMeSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
  console.log("SnackMeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

  getWelcomeResponse(response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
SnackMeSkill.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);

  //Any session cleanup logic would go here.
};
SnackMeSkill.prototype.intentHandlers = {
  "RegisterUserIntent": function(intent, session, response) {
    handleRegisterUserIntent(intent, session, response);
  },

  "GiveMeSnackIntent": function(intent, session, response) {
    handleGiveMeSnackIntent(intent, session, response);
  },

  "AddSnackIntent": function(intent, session, response) {
    handleAddSnackIntent(intent, session, response);
  },

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechText = "";

    var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    // For the repromptText, play the speechOutput again
    response.ask(speechOutput, repromptOutput);
  },

  "AMAZON.StopIntent": function(intent, session, response) {
    var speechOutput = "Goodbye";
    response.tell(speechOutput);
  },

  "AMAZON.CancelIntent": function(intent, session, response) {
    var speechOutput = "Goodbye";
    response.tell(speechOutput);
  }
};

function getWelcomeResponse(response) {
  // If we wanted to initialize the session to have some attributes we could add those here.
  var speechText = "With SnackMe, you can share your favorite snacks with and get suggestions for snacks from friends. What is your name?";
  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };
  var repromptOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };
  response.ask(speechOutput, repromptOutput);
}


function handleRegisterUserIntent(intent, session, response) {
  var username_slot = intent.slots.Username;
  session.attributes.cur_user = username_slot.value;
  var speechText = "";
  var user_already_exists = false;
  for (int i = 0; i < SNACK_LIST.length; i++) {
    if (session.attributes.cur_user == SNACK_LIST[i].friend_name) {
      speechText = "Welcome back, " + SNACK_LIST[i].friend_name;
      user_already_exists = true;
      break;
    }
  }
  if (!user_already_exists) {
    speechText = "Welcome " + session.attributes.cur_user;
  }

  speechText += "Get a Snack Suggestion or give a snack a some rank.";

  var speechOutput = {
    speech: '<speak>' + speechText + '</speak>',
    type: AlexaSkill.speechOutputType.SSML
  };
  var repromptOutput = {
    speech: '<speak>' + speechText + '</speak>',
    type: AlexaSkill.speechOutputType.SSML
  };
  response.ask(speechOutput, repromptOutput);
}


/**
 * Selects a joke randomly and starts it off by saying "Knock knock".
 */
function handleGiveMeSnackIntent(intent, session, response) {
  var speechText = "";
  //     {snack_name: "Kitkat", ranking: "9", friend_name: "Max"},
  //Select a random snack and store it in the session variables.
  var snackID = Math.floor(Math.random() * SNACK_LIST.length);
  var user = "";
  if (SNACK_LIST[snackNameSlot].friend_name == session.attributes.cur_user) {
    user = "You";
  } else {
    user = SNACK_LIST[snackID].friend_name;
  }

  speechText = "Eat a " + SNACK_LIST[snackID].snack_name + ". " + user + " gave it a ranking of " + SNACK_LIST[snackID].ranking;
  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };
  response.ask(speechOutput, speechOutput);
}

/**
 * Responds to the user saying "Who's there".
 */
function handleAddSnackIntent(intent, session, response) {

  var snackNameSlot = intent.slots.SnackName;
  var snackRankSlot = intent.slots.SnackRank;
  var new_snack_name = snackNameSlot.value;
  var new_snack_ranking = snackRankSlot.value;
  var new_snack = {
    snack_name: new_snack_name,
    ranking: new_snack_ranking,
    friend_name: session.attributes.cur_user
  };
  SNACK_LIST.push(new_snack);
  var speechText = "Adding " + new_snack_name + " with a rank of " + new_snack_ranking;
  var repromptText = "handle add snack reprompt text";
  //todo: error handling
  var speechOutput = {
    speech: '<speak>' + speechText + '</speak>',
    type: AlexaSkill.speechOutputType.SSML
  };
  var repromptOutput = {
    speech: '<speak>' + repromptText + '</speak>',
    type: AlexaSkill.speechOutputType.SSML
  };
  response.ask(speechOutput, repromptOutput);
}



// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
  // Create an instance of the SnackMe Skill.
  var skill = new SnackMeSkill();
  skill.execute(event, context);
};
