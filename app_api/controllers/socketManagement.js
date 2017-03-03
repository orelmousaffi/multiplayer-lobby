//Initialize global variables
var crypto  = require('crypto');
var onlineUsers = [];

//The following function is used to find a queued user for a match
var connectToUser = function(username)
{
  //Get the first user on the list
  var opponent = onlineUsers[0];

  //Check if the user exists
  if(typeof opponent !== 'undefined') {
    //Only take the user off the list if it's not the current user
    opponent = (opponent.username !== username) ? opponent = onlineUsers.shift() : null;

    return opponent;
  }
  return false;
}

//Create custom function to check if the list of users has a particular user
//based off of an email address
Array.prototype.hasEmail = function(username) {
  //Default to false
  var valid = false;

  //Check if the list is empty
  if (this.length > 0) {
    //Check through all elements
    this.forEach(function(next) {
      //Check for the username provided
      if (next.username === username) {
        //Flag successful if found
        valid = true;
        return;
      }
    });
  }
  return valid;
};

//Create custom function to remeove a user based on the username provided
Array.prototype.removeByEmail = function(username) {
  //Check if the list is empty
  if (this.size > 0) {
    //Check through all elements
    this.forEach(function(next, index) {
      //If the username is found, remove and exit loop
      if (username === next.username) {
        this.splice(index, 1);
        return;
      }
    });
  }
}

module.exports.socketCommunications = function(io, socket){

  //Listen for users to be added to the list, or search for online players
  socket.on("subscribe", function(username) {

    //Recieve an opponent if found
    var opponent = connectToUser(username);

    //Check if this is a new user connecting
    if (!opponent && !onlineUsers.hasEmail(username)) {

        //Generate a unique room id based off of a random salt and
        //the user's email address
        var salt = crypto.randomBytes(16).toString('hex');
        var room = crypto.pbkdf2Sync(
          username,
          salt,
          1000,
          32
        ).toString('hex');

        //Create a key pair for the user and room id
        var nextUser = {
          username: username,
          pairingKey: room
        }

        //Add the user to the room and add to list of available players
        socket.join(room);
        onlineUsers.push(nextUser);
    }
    else {

      //Check if an opponent was found
      if (opponent)
      {
        //Join the user to the opponents room and remove from list
        //of available players
        socket.join(opponent.pairingKey);
        onlineUsers.removeByEmail(username);

        //Broadcast message to all players in room
        io.sockets.in(opponent.pairingKey).emit('private match', {
          message : username + " vs " + opponent.username,
          pairingKey : opponent.pairingKey
        });
      }
    }
    io.emit("show users", onlineUsers);
  });

  //Broadcast message to all players in room on play action
  socket.on("play", function (data) {
    io.sockets.in(data.pairingKey).emit('private match', {
      message : data.message
    });
  });

  //Update the list to show on screen
  socket.on("show users", function() {
    io.emit("show users", onlineUsers);
  });

  //Show when the user disconnects
  socket.on("disconnect", function() {
    console.log("A user has disconnected")
  });
}
