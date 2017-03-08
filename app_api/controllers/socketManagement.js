//Initialize global variables
var crypto  = require('crypto');
var rankedUsers = [];
var onlineUsers = [];

//The following function is used to find a queued user for a match
var connectToUser = function(username)
{
  //Check if the list of ranked players is empty
  if (rankedUsers.length > 0) {
    //Get the first user on the list
    var opponent = rankedUsers[0];

    //Check if the user exists
    if(typeof opponent !== 'undefined') {
      //Only take the user off the list if it's not the current user
      opponent = (opponent.username !== username) ? opponent = rankedUsers.shift() : null;

      return opponent;
    }
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
  if (this.length > 0) {
    //Check through all elements
    this.forEach(function(next, index) {
      //If the username is found, remove and exit loop
      if (username === next.username) {
        this.splice(index, 1);
        return;
      }
    });
  }
};

Array.prototype.getByEmail = function(username) {
  var userFound = null;

  //Check if the list is empty
  if (this.length > 0) {
    //Check through all elements
    this.forEach(function(next, index) {
      //If the username is found, store it and exit loop
      if (username === next.username) {

        userFound = next;
        return;
      }
    });
  }

  return userFound;
};

module.exports.socketCommunications = function(io, socket){

  socket.on("test", function() {
    console.log("test");
  });

  socket.on("set online", function(username) {
    //Check if this is a new user connecting
    if (!onlineUsers.hasEmail(username)) {

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
      var newUser = {
        username: username,
        pairingKey: room
      }

      //Add the user to the room and add to list of available players
      socket.join(room);
      onlineUsers.push(newUser);
    }
  });

  socket.on("connect to friend", function(username, friend) {
    //Get the user from the list of online players
    var user = onlineUsers.getByEmail(username);
    socket.broadcast.to(friend.pairingKey).emit("friend request", user);
  });

  socket.on("accept friend request", function(friend, username) {
    socket.join(friend.pairingKey);
    //Broadcast message to all players in room
    io.sockets.in(friend.pairingKey).emit('private match', {
      message : username + " vs " + friend.username,
      pairingKey : friend.pairingKey
    });
  })

  //Listen for users to be added to the list, or search for online players
  socket.on("subscribe", function(username) {

    //Recieve an opponent if found
    var opponent = connectToUser(username);

    //Check if this is a new ranked user connecting
    if (!opponent && !rankedUsers.hasEmail(username)) {

        //Get the user from the list of online players
        var nextUser = onlineUsers.getByEmail(username);

        if (nextUser) {
          //Add the user to the room and add to list of available ranked players
          socket.join(nextUser.pairingKey);
          rankedUsers.push(nextUser);
        }
    }
    else {

      //Check if an opponent was found
      if (opponent)
      {
        //Join the user to the opponents room and remove from list
        //of available players
        socket.join(opponent.pairingKey);
        rankedUsers.removeByEmail(username);

        //Broadcast message to all players in room
        io.sockets.in(opponent.pairingKey).emit('private match', {
          message : username + " vs " + opponent.username,
          pairingKey : opponent.pairingKey
        });
      }
    }
    io.emit("show users", rankedUsers, onlineUsers);
  });

  //Broadcast message to all players in room on play action
  socket.on("play", function (data) {
    io.sockets.in(data.pairingKey).emit('private match', {
      message : data.message
    });
  });

  //Update the list to show on screen
  socket.on("show users", function() {
    io.emit("show users", rankedUsers, onlineUsers);
  });

  //Show when the user disconnects
  socket.on("disconnect", function() {
    console.log("A user has disconnected")
  });
}
