//Include the mongoose module
var mongoose = require('mongoose');

//Create the databaes connection string
var dbURI = "mongodb://localhost/testDB";

//Connect the mongoose controller to the database
mongoose.connect(dbURI);

//Print a message when a connection is established
mongoose.connection.on('connected', function () {
  console.log("Mongoose is connected to: " + dbURI);
});

//Print an error message if one is thrown
mongoose.connection.on('error', function(error) {
  console.log("An error has occurred: " + error);
});

//Print a message when the database has been disconnected
mongoose.connection.on('disconnected', function() {
  console.log("Mongoose has been disconnected");
});

/*
* The following function is called to properly disconnet from the database.
* The provided message is displayed to reviel the source of disconnection
* and the callback function handles the termination of the running process.
*
* @param: msg - The message describing how connection is being terminated
* @param: callback - The callback function that kills the process
*/
var dbShutdown = function (msg, callback) {
  mongoose.connection.close(function() {
    console.log("Mongoose has disconnected via: " + msg);
    callback();
  });
};

//Execute the shutdown function to properly close the connection
//when Nodemon restarts the server
process.once("SIGUSR2", function() {
  dbShutdown("Nodemon Restart", function() {
    process.kill(process.pid, "SIGUSR2");
  });
});

//Execute the shutdown function to close the connection on server termination
process.on("SIGINT", function() {
  dbShutdown("App Termination", function() {
    process.exit(0);
  });
});

//Include all the defined Schemas
require("./users");
